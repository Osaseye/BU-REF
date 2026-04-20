"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeLecturer = exports.inviteLecturer = exports.createStudentSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// 1. createStudentSession
exports.createStudentSession = (0, https_1.onCall)(async (request) => {
    const { matricNo, umisData } = request.data;
    if (!matricNo || !umisData) {
        throw new https_1.HttpsError("invalid-argument", "Missing matricNo or umisData");
    }
    try {
        // 1. Update or create the student profile in Firestore
        await db.collection("students").doc(matricNo).set({
            matricNo,
            fullName: umisData.fullName,
            department: umisData.department,
            faculty: umisData.faculty,
            cgpa: umisData.cgpa,
            level: umisData.level,
            graduationYear: umisData.graduationYear || null,
            lastUmisSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            // System fields that might not exist yet
            profileComplete: false,
        }, { merge: true });
        // 2. Mint the custom token
        // We add matricNo as a custom claim so Security Rules can enforce identity
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
    const { name, email, department } = data;
    if (!name || !email) {
        throw new https_1.HttpsError("invalid-argument", "Name and email are required fields.");
    }
    try {
        // Ensure the caller is an Admin
        const adminDoc = await db.collection("admins").doc(auth.uid).get();
        if (!adminDoc.exists) {
            throw new https_1.HttpsError("permission-denied", "Only admins can invite lecturers.");
        }
        // 1. Create the Firebase Auth User
        const userRecord = await admin.auth().createUser({
            email,
            displayName: name,
            // You must provide a random password, but they will reset it via email immediately
            password: Math.random().toString(36).slice(-10) + "A1!",
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
        // 3. Send password reset email
        const link = await admin.auth().generatePasswordResetLink(email);
        // Ideally use an email service to send `link` to them, or log it if you have Firebase's default email template disabled
        // For now, it's generated. Firebase Auth `generatePasswordResetLink` does NOT send the email automatically.
        // If you want Firebase to send the default email directly, use the client SDK instead, OR use an extension like 'Trigger Email'.
        return { success: true, uid: userRecord.uid, link };
    }
    catch (error) {
        console.error("Error inviting lecturer:", error);
        throw new https_1.HttpsError("internal", "Failed to invite lecturer");
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
//# sourceMappingURL=index.js.map