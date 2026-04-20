import { useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../lib/firebase';
import type { UmisStudentData } from '../types';

export const useUmisAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (matricNo: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call proxy
      const proxyUrl = import.meta.env.VITE_UMIS_PROXY_URL;
      if (!proxyUrl) {
        throw new Error('UMIS Proxy URL is not configured.');
      }

      const response = await fetch(`${proxyUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matricNo, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authenticate with UMIS');
      }

      const umisData: UmisStudentData = await response.json();

      // 2. Call Cloud Function
      const createStudentSession = httpsCallable(functions, 'createStudentSession');
      const result = await createStudentSession({ matricNo, umisData });
      const { token } = result.data as { token: string };

      // 3. Authenticate with Firebase
      await signInWithCustomToken(auth, token);
      
      // Success! AuthContext will pick up the state change
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
