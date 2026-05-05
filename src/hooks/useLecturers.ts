import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import type { LecturerProfile } from '../types';
import { toast } from 'sonner';
import { getUserFacingErrorMessage } from '../lib/authErrors';

export const useLecturers = () => {
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'lecturers'), orderBy('invitedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LecturerProfile);
      setLecturers(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error('Failed to load lecturers');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const inviteLecturer = async (name: string, email: string, department?: string, password?: string) => {
    setLoading(true);
    try {
      const inviteFunc = httpsCallable(functions, 'inviteLecturer');
      await inviteFunc({ name, email, department, password });
      toast.success(`Account created for ${name}. Share their email and initial password with them to log in.`);
    } catch (error: any) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Failed to invite lecturer. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const revokeLecturer = async (uid: string) => {
    setLoading(true);
    try {
      const revokeFunc = httpsCallable(functions, 'revokeLecturer');
      await revokeFunc({ uid });
      toast.success('Lecturer access revoked');
    } catch (error: any) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Failed to revoke lecturer access. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return { lecturers, loading, inviteLecturer, revokeLecturer };
};
