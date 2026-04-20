import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { StudentProfile } from '../types';

export const useStudent = (matricNo?: string) => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single student if matricNo is provided, else fetch all (or support searching)
  useEffect(() => {
    let unsubscribe: () => void;

    const fetchStudent = async () => {
      if (!matricNo) return;
      setLoading(true);
      try {
        const studentRef = doc(db, 'students', matricNo);
        unsubscribe = onSnapshot(studentRef, (docSnap) => {
          if (docSnap.exists()) {
            setStudent(docSnap.data() as StudentProfile);
          } else {
            setStudent(null);
          }
          setLoading(false);
        });
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudent();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [matricNo]);

  const searchStudents = async (searchTerm: string) => {
    setLoading(true);
    try {
      // NOTE: Simple prefix search. For robust searching, Algolia or MeiliSearch is ideal.
      const studentsRef = collection(db, 'students');
      const terms = searchTerm.toLowerCase().split(' ');
      
      // Basic query - you will need adequate indexing for complex queries
      const q = query(studentsRef); 
      const querySnapshot = await getDocs(q);
      const results: StudentProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as StudentProfile;
        const matches = terms.every(
          term => data.fullName.toLowerCase().includes(term) || 
                  data.matricNo.toLowerCase().includes(term) ||
                  data.department.toLowerCase().includes(term)
        );
        if (matches) results.push(data);
      });
      setStudents(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { student, students, loading, error, searchStudents };
};
