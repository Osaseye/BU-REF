import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as bcrypt from "bcryptjs";

admin.initializeApp();

const db = admin.firestore();
const BOOTSTRAP_SECRET = defineSecret("BOOTSTRAP_SECRET");

// Salt rounds for bcrypt — 12 is a good balance of security and speed on Cloud Functions
const SALT_ROUNDS = 12;

// 1. createStudentSession
export const createStudentSession = onCall(async (request) => {
  const { matricNo, umisData, password } = request.data;

  if (!matricNo || !umisData) {
    throw new HttpsError("invalid-argument", "Missing matricNo or umisData");
  }

  try {
    const safeId = matricNo.replace(/\//g, '-');

    // 1. Update or create the student profile in Firestore (merge preserves editable fields)
    await db.collection("students").doc(safeId).set(
      {
        matricNo,
        fullName: umisData.fullName,
        department: umisData.department,
        faculty: umisData.faculty,
        cgpa: umisData.cgpa,
        level: umisData.level,
        graduationYear: umisData.graduationYear || null,
        lastUmisSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        profileComplete: false,
      },
      { merge: true }
    );

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
  } catch (error) {
    console.error("Error creating student session:", error);
    throw new HttpsError("internal", "Unable to create student session");
  }
});

// 2. inviteLecturer
export const inviteLecturer = onCall(async (request) => {
  const { auth, data } = request;
  
  if (!auth) {
    throw new HttpsError("unauthenticated", "You must be logged in to invite lecturers.");
  }

  const { name, email, department, password } = data;
  
  if (!name || !email) {
    throw new HttpsError("invalid-argument", "Name and email are required fields.");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new HttpsError("invalid-argument", "Password must be at least 8 characters.");
  }

  try {
    // Ensure the caller is an Admin
    const adminDoc = await db.collection("admins").doc(auth.uid).get();
    if (!adminDoc.exists) {
      throw new HttpsError("permission-denied", "Only admins can invite lecturers.");
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

  } catch (error: any) {
    console.error("Error inviting lecturer:", error);
    if (error?.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "An account with this email already exists.");
    }
    throw new HttpsError("internal", "Failed to create lecturer account.");
  }
});

// 3. revokeLecturer
export const revokeLecturer = onCall(async (request) => {
  const { auth, data } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  const { uid } = data;

  try {
    // Ensure caller is Admin
    const adminDoc = await db.collection("admins").doc(auth.uid).get();
    if (!adminDoc.exists) {
      throw new HttpsError("permission-denied", "Only admins can revoke lecturers.");
    }

    await db.collection("lecturers").doc(uid).update({
      status: "revoked"
    });

    // Optional: You could also disable their Auth account
    // await admin.auth().updateUser(uid, { disabled: true });

    return { success: true };
  } catch (error) {
    console.error("Error revoking lecturer:", error);
    throw new HttpsError("internal", "Failed to revoke lecturer");
  }
});

// 4. bulkSyncStudentsFromUmis — admin-only, hits the UMIS bulk export endpoint
export const bulkSyncStudentsFromUmis = onCall(async (request) => {
  const { auth } = request;

  if (!auth) {
    throw new HttpsError("unauthenticated", "You must be logged in.");
  }

  // Gate: caller must be an admin
  const adminDoc = await db.collection("admins").doc(auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError("permission-denied", "Only admins can trigger a bulk sync.");
  }

  const umisApiUrl = process.env.UMIS_BULK_API_URL;
  const umisApiKey  = process.env.UMIS_BULK_API_KEY;

  if (!umisApiUrl) {
    throw new HttpsError("failed-precondition", "UMIS_BULK_API_URL is not configured.");
  }

  let students: any[];
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

    const body = await res.json() as any;
    // Support both { students: [...] } and a raw array
    students = Array.isArray(body) ? body : body.students ?? body.data ?? [];
  } catch (err: any) {
    console.error("Bulk sync — UMIS fetch failed:", err);
    throw new HttpsError("unavailable", `Could not reach UMIS: ${err.message}`);
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new HttpsError("not-found", "UMIS returned no student records.");
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
        const matricNo: string = s.matricNo || s.matric_no || s.matric;
        if (!matricNo) { failed++; continue; }

        const safeId = matricNo.replace(/\//g, "-");
        const ref = db.collection("students").doc(safeId);

        batch.set(
          ref,
          {
            matricNo,
            fullName:       s.fullName       || s.full_name       || "",
            department:     s.department     || "",
            faculty:        s.faculty        || "",
            cgpa:           s.cgpa           ?? null,
            level:          s.level          || "",
            graduationYear: s.graduationYear || s.graduation_year || null,
            lastUmisSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            profileComplete: false,
          },
          { merge: true }   // preserves student-edited fields
        );
        synced++;
      } catch {
        failed++;
      }
    }

    await batch.commit();
  }

  // Record sync metadata
  await db.collection("meta").doc("lastSync").set({
    lastSyncAt:   admin.firestore.FieldValue.serverTimestamp(),
    studentCount: synced,
    status:       failed === 0 ? "success" : synced > 0 ? "partial" : "failed",
    syncedBy:     auth.uid,
  });

  return { synced, failed };
});

// 5. verifyStudentOffline — validates cached password hash when UMIS is unreachable
export const verifyStudentOffline = onCall(async (request) => {
  const { matricNo, password } = request.data;

  if (!matricNo || !password) {
    throw new HttpsError("invalid-argument", "matricNo and password are required.");
  }

  const safeId = (matricNo as string).replace(/\//g, "-");

  try {
    const credDoc = await db
      .collection("students")
      .doc(safeId)
      .collection("private")
      .doc("credentials")
      .get();

    if (!credDoc.exists) {
      throw new HttpsError(
        "not-found",
        "UMIS is offline and no cached credentials exist for this account. " +
        "Please try again when UMIS is available."
      );
    }

    const { passwordHash } = credDoc.data() as { passwordHash: string };
    const match = await bcrypt.compare(password as string, passwordHash);

    if (!match) {
      throw new HttpsError("unauthenticated", "Incorrect password.");
    }

    // Mint a custom token — same claims as the online flow
    const customToken = await admin.auth().createCustomToken(matricNo, { matricNo });
    return { token: customToken };
  } catch (error: any) {
    if (error instanceof HttpsError) throw error;
    console.error("verifyStudentOffline error:", error);
    throw new HttpsError("internal", "Unable to verify offline credentials.");
  }
});

// 6. bootstrapAdmin — one-time function to create the first admin user
export const bootstrapAdmin = onCall({ secrets: [BOOTSTRAP_SECRET] }, async (request) => {
  const { name, email, password, bootstrapKey } = request.data;

  // Validate inputs
  if (!name || !email || !password || !bootstrapKey) {
    throw new HttpsError("invalid-argument", "name, email, password, and bootstrapKey are required.");
  }

  // Verify the bootstrap secret
  const secret = BOOTSTRAP_SECRET.value();
  if (!secret) {
    throw new HttpsError("failed-precondition", "Bootstrap is not configured on this server.");
  }
  if (bootstrapKey !== secret) {
    throw new HttpsError("permission-denied", "Invalid bootstrap key.");
  }

  // Ensure no admins exist yet — prevents abuse after first admin is created
  const adminsSnap = await db.collection("admins").limit(1).get();
  if (!adminsSnap.empty) {
    throw new HttpsError(
      "failed-precondition",
      "An admin account already exists. Bootstrap is disabled."
    );
  }

  // Create the Firebase Auth user
  let uid: string;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    uid = userRecord.uid;
  } catch (err: any) {
    console.error("bootstrapAdmin createUser error:", err);
    if (err.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "An account with this email already exists.");
    }
    throw new HttpsError("internal", "Failed to create admin auth account.");
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