import { auth, db } from "./firebase";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, serverTimestamp } from "firebase/firestore";
import type { StudentProfile, LecturerProfile, AdminProfile } from "../types";

export const firestore = {
  // Use carefully - prefer specific update functions
  getStudent: async (matricNo: string) => {
    const docRef = doc(db, "students", matricNo);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StudentProfile;
    }
    return null;
  },

  updateStudentProfile: async (matricNo: string, data: Partial<StudentProfile>) => {
    const docRef = doc(db, "students", matricNo);
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
};
