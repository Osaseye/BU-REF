import { useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { auth, functions } from '../lib/firebase';
import { getUserFacingErrorMessage } from '../lib/authErrors';
import type { UmisStudentData } from '../types';

// How long (ms) to wait for the UMIS proxy before assuming it is down
const UMIS_TIMEOUT_MS = 8_000;

export const useUmisAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (matricNo: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const proxyUrl = import.meta.env.VITE_UMIS_PROXY_URL;
      if (!proxyUrl) {
        throw new Error('UMIS Proxy URL is not configured. Check your environment variables.');
      }

      // ── Attempt 1: live UMIS verification ─────────────────────────────────
      let token: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UMIS_TIMEOUT_MS);

        const response = await fetch(`${proxyUrl}/auth.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matricNo, password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const umisData: UmisStudentData = await response.json();

          // Pass password so Cloud Function can cache the hash for future offline logins
          const createStudentSession = httpsCallable(functions, 'createStudentSession');
          const result = await createStudentSession({ matricNo, umisData, password });
          token = (result.data as { token: string }).token;
        }
      } catch (umisError: any) {
        // AbortError = timeout; other network errors also land here
        const isTimeout = umisError?.name === 'AbortError';
        console.warn(isTimeout ? 'UMIS timed out' : 'UMIS unreachable:', umisError?.message);
      }

      // ── Attempt 2: offline fallback (cached password hash) ────────────────
      if (!token) {
        const verifyStudentOffline = httpsCallable(functions, 'verifyStudentOffline');
        const result = await verifyStudentOffline({ matricNo, password });
        token = (result.data as { token: string }).token;

        toast.warning('UMIS is currently unavailable — signed in using cached credentials.');
      }

      // ── Establish Firebase session ─────────────────────────────────────────
      await signInWithCustomToken(auth, token);
    } catch (err: any) {
      console.error(err);
      const message = getUserFacingErrorMessage(err, 'Login failed. Please try again.');
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
