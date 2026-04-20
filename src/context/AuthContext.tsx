import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firestore } from '../lib/firestore';
import type { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      if (firebaseUser) {
        // Important: Getting Custom Claims from token
        const tokenResult = await firebaseUser.getIdTokenResult();
        const matricNo = tokenResult.claims.matricNo as string | undefined;

        if (matricNo) {
          // It's a student (from custom token)
          const profile = await firestore.getStudent(matricNo);
          if (profile) {
            setUser({ uid: firebaseUser.uid, role: 'student', profile });
          } else {
             // Fallback if empty but should exist due to cloud fn
             setUser(null);
             auth.signOut();
          }
        } else {
          // It's Staff (Admin or Lecturer)
          const adminProfile = await firestore.getAdmin(firebaseUser.uid);
          if (adminProfile) {
            setUser({ uid: firebaseUser.uid, role: 'admin', profile: adminProfile });
          } else {
            const lecturerProfile = await firestore.getLecturer(firebaseUser.uid);
            if (lecturerProfile && lecturerProfile.status === 'active') {
              setUser({ uid: firebaseUser.uid, role: 'lecturer', profile: lecturerProfile });
            } else {
              // Revoked or doesn't exist
              setUser(null);
              auth.signOut();
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);