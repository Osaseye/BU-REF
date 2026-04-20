import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import type { LecturerProfile } from '../types';
import { toast } from 'sonner';

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

  const inviteLecturer = async (name: string, email: string, department?: string) => {
    setLoading(true);
    try {
      const inviteFunc = httpsCallable(functions, 'inviteLecturer');
      await inviteFunc({ name, email, department });
      toast.success(`Lecturer ${name} invited successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to invite lecturer');
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
      toast.error(error.message || 'Failed to revoke lecturer access');
    } finally {
      setLoading(false);
    }
  };

  return { lecturers, loading, inviteLecturer, revokeLecturer };
};
