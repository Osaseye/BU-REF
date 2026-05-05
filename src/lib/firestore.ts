import { db } from "./firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { StudentProfile, LecturerProfile, AdminProfile, SyncMeta } from "../types";

export const firestore = {
  // Use carefully - prefer specific update functions
  getStudent: async (matricNo: string) => {
    const safeId = matricNo.replace(/\//g, '-');
    const docRef = doc(db, "students", safeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StudentProfile;
    }
    return null;
  },

  updateStudentProfile: async (matricNo: string, data: Partial<StudentProfile>) => {
    const safeId = matricNo.replace(/\//g, '-');
    const docRef = doc(db, "students", safeId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  getLecturer: async (uid: string) => {
    const docRef = doc(db, "lecturers", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as LecturerProfile;
    }
    return null;
  },

  getAdmin: async (uid: string) => {
    const docRef = doc(db, "admins", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminProfile;
    }
    return null;
  },

  getLastSyncMeta: async (): Promise<SyncMeta | null> => {
    const docRef = doc(db, "meta", "lastSync");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SyncMeta;
    }
    return null;
  },
};
