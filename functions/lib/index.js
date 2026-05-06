"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapAdmin = exports.verifyStudentOffline = exports.bulkSyncStudentsFromUmis = exports.revokeLecturer = exports.inviteLecturer = exports.createStudentSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
admin.initializeApp();
const db = admin.firestore();
const BOOTSTRAP_SECRET = (0, params_1.defineSecret)("BOOTSTRAP_SECRET");
const UMIS_BULK_API_URL = (0, params_1.defineString)("UMIS_BULK_API_URL", { default: "https://bu-ref-proxy.onrender.com/mock-bulk.php" });
const UMIS_BULK_API_KEY = (0, params_1.defineString)("UMIS_BULK_API_KEY", { default: "" });
// Salt rounds for bcrypt — 12 is a good balance of security and speed on Cloud Functions
const SALT_ROUNDS = 12;
// 1. createStudentSession
exports.createStudentSession = (0, https_1.onCall)(async (request) => {
    const { matricNo, umisData, password } = request.data;
    if (!matricNo || !umisData) {
        throw new https_1.HttpsError("invalid-argument", "Missing matricNo or umisData");
    }
    try {
        const safeId = matricNo.replace(/\//g, '-');
        // 1. Update or create the student profile in Firestore (merge preserves editable fields)
        await db.collection("students").doc(safeId).set({
            matricNo,
            fullName: umisData.fullName,
            department: umisData.department,
            faculty: umisData.faculty,
            cgpa: umisData.cgpa,
            level: umisData.level,
            graduationYear: umisData.graduationYear || null,
            lastUmisSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            profileComplete: false,
        }, { merge: true });
        // 2. Cache a bcrypt hash of the password for offline fallback login
        if (password && typeof password === "string" && password.length > 0) {
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            await db
                .collection("students")
                .doc(safeId)
                .collection("private")
                .doc("credentials")
                .set({ passwordHash, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        // 3. Mint the custom token with matricNo claim
        const customToken = await admin.auth().createCustomToken(matricNo, { matricNo });
        return { token: customToken };
    }
    catch (error) {
        console.error("Error creating student session:", error);
        throw new https_1.HttpsError("internal", "Unable to create student session");
    }
});
// 2. inviteLecturer
exports.inviteLecturer = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in to invite lecturers.");
    }
    const { name, email, department, password } = data;
    if (!name || !email) {
        throw new https_1.HttpsError("invalid-argument", "Name and email are required fields.");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        throw new https_1.HttpsError("invalid-argument", "Password must be at least 8 characters.");
    }
    try {
        // Ensure the caller is an Admin
        const adminDoc = await db.collection("admins").doc(auth.uid).get();
        if (!adminDoc.exists) {
            throw new https_1.HttpsError("permission-denied", "Only admins can invite lecturers.");
        }
        // 1. Create the Firebase Auth user with the admin-set initial password
        const userRecord = await admin.auth().createUser({
            email,
            displayName: name,
            password,
        });
        // 2. Add to `lecturers` collection
        await db.collection("lecturers").doc(userRecord.uid).set({
            uid: userRecord.uid,
            fullName: name,
            email: email,
            department: department || null,
            invitedBy: auth.uid,
            invitedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "active",
        });
        return { success: true, uid: userRecord.uid };
    }
    catch (error) {
        console.error("Error inviting lecturer:", error);
        // Re-throw errors we already constructed (e.g. permission-denied from admin check)
        if (error instanceof https_1.HttpsError)
            throw error;
        // Map known Firebase Auth error codes to friendly messages
        const authCode = error?.code ?? "";
        if (authCode === "auth/email-already-exists") {
            throw new https_1.HttpsError("already-exists", "An account with this email already exists.");
        }
        if (authCode === "auth/invalid-email") {
            throw new https_1.HttpsError("invalid-argument", "The email address is not valid.");
        }
        if (authCode === "auth/invalid-password") {
            throw new https_1.HttpsError("invalid-argument", "Password must be at least 6 characters.");
        }
        console.error("Unhandled inviteLecturer error code:", authCode, error?.message);
        throw new https_1.HttpsError("internal", "Failed to create lecturer account.");
    }
});
// 3. revokeLecturer
exports.revokeLecturer = (0, https_1.onCall)(async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { uid } = data;
    try {
        // Ensure caller is Admin
        const adminDoc = await db.collection("admins").doc(auth.uid).get();
        if (!adminDoc.exists) {
            throw new https_1.HttpsError("permission-denied", "Only admins can revoke lecturers.");
        }
        await db.collection("lecturers").doc(uid).update({
            status: "revoked"
        });
        // Optional: You could also disable their Auth account
        // await admin.auth().updateUser(uid, { disabled: true });
        return { success: true };
    }
    catch (error) {
        console.error("Error revoking lecturer:", error);
        throw new https_1.HttpsError("internal", "Failed to revoke lecturer");
    }
});
// 4. bulkSyncStudentsFromUmis — admin-only, hits the UMIS bulk export endpoint
exports.bulkSyncStudentsFromUmis = (0, https_1.onCall)(async (request) => {
    const { auth } = request;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in.");
    }
    // Gate: caller must be an admin
    const adminDoc = await db.collection("admins").doc(auth.uid).get();
    if (!adminDoc.exists) {
        throw new https_1.HttpsError("permission-denied", "Only admins can trigger a bulk sync.");
    }
    const umisApiUrl = UMIS_BULK_API_URL.value();
    const umisApiKey = UMIS_BULK_API_KEY.value();
    let students;
    try {
        const res = await fetch(umisApiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(umisApiKey ? { Authorization: `Bearer ${umisApiKey}` } : {}),
            },
        });
        if (!res.ok) {
            throw new Error(`UMIS bulk endpoint returned ${res.status}`);
        }
        const body = await res.json();
        // Support both { students: [...] } and a raw array
        students = Array.isArray(body) ? body : body.students ?? body.data ?? [];
    }
    catch (err) {
        console.error("Bulk sync — UMIS fetch failed:", err);
        throw new https_1.HttpsError("unavailable", `Could not reach UMIS: ${err.message}`);
    }
    if (!Array.isArray(students) || students.length === 0) {
        throw new https_1.HttpsError("not-found", "UMIS returned no student records.");
    }
    // Firestore batch writes — max 500 ops per batch
    const BATCH_SIZE = 400;
    let synced = 0;
    let failed = 0;
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
        const chunk = students.slice(i, i + BATCH_SIZE);
        const batch = db.batch();
        for (const s of chunk) {
            try {
                const matricNo = s.matricNo || s.matric_no || s.matric;
                if (!matricNo) {
                    failed++;
                    continue;
                }
                const safeId = matricNo.replace(/\//g, "-");
                const ref = db.collection("students").doc(safeId);
                batch.set(ref, {
                    matricNo,
                    fullName: s.fullName || s.full_name || "",
                    department: s.department || "",
                    faculty: s.faculty || "",
                    cgpa: s.cgpa ?? null,
                    level: s.level || "",
                    graduationYear: s.graduationYear || s.graduation_year || null,
                    lastUmisSyncAt: admin.firestore.FieldValue.serverTimestamp(),
                    profileComplete: false,
                }, { merge: true } // preserves student-edited fields
                );
                synced++;
            }
            catch {
                failed++;
            }
        }
        await batch.commit();
    }
    // Record sync metadata
    await db.collection("meta").doc("lastSync").set({
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        studentCount: synced,
        status: failed === 0 ? "success" : synced > 0 ? "partial" : "failed",
        syncedBy: auth.uid,
    });
    return { synced, failed };
});
// 5. verifyStudentOffline — validates cached password hash when UMIS is unreachable
exports.verifyStudentOffline = (0, https_1.onCall)(async (request) => {
    const { matricNo, password } = request.data;
    if (!matricNo || !password) {
        throw new https_1.HttpsError("invalid-argument", "matricNo and password are required.");
    }
    const safeId = matricNo.replace(/\//g, "-");
    try {
        const credDoc = await db
            .collection("students")
            .doc(safeId)
            .collection("private")
            .doc("credentials")
            .get();
        if (!credDoc.exists) {
            throw new https_1.HttpsError("not-found", "UMIS is offline and no cached credentials exist for this account. " +
                "Please try again when UMIS is available.");
        }
        const { passwordHash } = credDoc.data();
        const match = await bcrypt.compare(password, passwordHash);
        if (!match) {
            throw new https_1.HttpsError("unauthenticated", "Incorrect password.");
        }
        // Mint a custom token — same claims as the online flow
        const customToken = await admin.auth().createCustomToken(matricNo, { matricNo });
        return { token: customToken };
    }
    catch (error) {
        if (error instanceof https_1.HttpsError)
            throw error;
        console.error("verifyStudentOffline error:", error);
        throw new https_1.HttpsError("internal", "Unable to verify offline credentials.");
    }
});
// 6. bootstrapAdmin — one-time function to create the first admin user
exports.bootstrapAdmin = (0, https_1.onCall)({ secrets: [BOOTSTRAP_SECRET] }, async (request) => {
    const { name, email, password, bootstrapKey } = request.data;
    // Validate inputs
    if (!name || !email || !password || !bootstrapKey) {
        throw new https_1.HttpsError("invalid-argument", "name, email, password, and bootstrapKey are required.");
    }
    // Verify the bootstrap secret
    const secret = BOOTSTRAP_SECRET.value();
    if (!secret) {
        throw new https_1.HttpsError("failed-precondition", "Bootstrap is not configured on this server.");
    }
    if (bootstrapKey !== secret) {
        throw new https_1.HttpsError("permission-denied", "Invalid bootstrap key.");
    }
    // Ensure no admins exist yet — prevents abuse after first admin is created
    const adminsSnap = await db.collection("admins").limit(1).get();
    if (!adminsSnap.empty) {
        throw new https_1.HttpsError("failed-precondition", "An admin account already exists. Bootstrap is disabled.");
    }
    // Create the Firebase Auth user
    let uid;
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        uid = userRecord.uid;
    }
    catch (err) {
        console.error("bootstrapAdmin createUser error:", err);
        if (err.code === "auth/email-already-exists") {
            throw new https_1.HttpsError("already-exists", "An account with this email already exists.");
        }
        throw new https_1.HttpsError("internal", "Failed to create admin auth account.");
    }
    // Set custom claim so auth state can identify admin role
    await admin.auth().setCustomUserClaims(uid, { role: "admin" });
    // Write to Firestore admins collection
    await db.collection("admins").doc(uid).set({
        uid,
        email,
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, uid };
});
//# sourceMappingURL=index.js.map