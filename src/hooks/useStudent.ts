import { useState, useEffect } from 'react';
import { collection, query, getDocs, onSnapshot, doc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getUserFacingErrorMessage } from '../lib/authErrors';
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

      // Intercept purely mock data for UI demonstrations (used in AdminDashboard)
      if (['19/0001', '19/0002', '19/0003', '19/0004', '19/0005', '19/0006'].includes(matricNo)) {
        setStudent({
          matricNo,
          fullName: 'Demo Student ' + matricNo,
          department: 'Computer Science',
          faculty: 'Computing & Engineering Sciences',
          cgpa: 4.50,
          level: '400L',
          contactEmail: 'demo@student.babcock.edu.ng',
          phoneNumber: '08000000000',
          projectTitle: 'Demo AI Project',
          supervisorName: 'Dr. Expert',
          profileComplete: true,
          bio: 'This is a mock profile for demonstration purposes.',
        } as StudentProfile);
        setLoading(false);
        return;
      }

      try {
        const safeId = matricNo.replace(/\//g, '-');
        const studentRef = doc(db, 'students', safeId);
        unsubscribe = onSnapshot(studentRef, (docSnap) => {
          if (docSnap.exists()) {
            setStudent(docSnap.data() as StudentProfile);
          } else {
            setStudent(null);
          }
          setLoading(false);
        });
      } catch (err: any) {
        setError(getUserFacingErrorMessage(err, 'Unable to load student details.'));
        setLoading(false);
      }
    };

    fetchStudent();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [matricNo]);

  const searchStudents = async (searchTerm: string, facultyFilter?: string) => {
    setLoading(true);
    try {
      // NOTE: Simple prefix search. For robust searching, Algolia or MeiliSearch is ideal.
      const studentsRef = collection(db, 'students');
      const terms = searchTerm.toLowerCase().split(' ');
      
      // When a faculty scope is provided (lecturer's school), filter server-side
      const q = facultyFilter
        ? query(studentsRef, where('faculty', '==', facultyFilter))
        : query(studentsRef);

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
      setError(getUserFacingErrorMessage(err, 'Unable to search students right now.'));
    } finally {
      setLoading(false);
    }
  };

  return { student, students, loading, error, searchStudents };
};
