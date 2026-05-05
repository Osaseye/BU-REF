/**
 * ⚠️  TEMPORARY PAGE — DELETE AFTER CREATING THE FIRST ADMIN USER  ⚠️
 *
 * This page exists solely to bootstrap the very first admin account.
 * Once an admin exists in Firestore, the bootstrapAdmin Cloud Function
 * will reject all further registration attempts.
 *
 * Steps:
 * 1. Set BOOTSTRAP_SECRET in Firebase Functions config:
 *      firebase functions:secrets:set BOOTSTRAP_SECRET
 * 2. Visit /admin/register and fill in the form.
 * 3. Log in at /login/admin with the credentials you just created.
 * 4. DELETE this file and remove the /admin/register route.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { functions } from '../../lib/firebase';
import { getUserFacingErrorMessage } from '../../lib/authErrors';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  bootstrapKey: z.string().min(1, 'Bootstrap key is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type AdminRegisterFormData = z.infer<typeof registerSchema>;

export const AdminRegister: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminRegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: AdminRegisterFormData) => {
    try {
      const bootstrapAdmin = httpsCallable(functions, 'bootstrapAdmin');
      await bootstrapAdmin({
        name: data.name,
        email: data.email,
        password: data.password,
        bootstrapKey: data.bootstrapKey,
      });

      toast.success('Admin account created. You can now log in.');
      navigate('/login/admin', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(getUserFacingErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Warning banner */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Temporary page.</strong> Delete this page and its route once the first admin
            account has been created.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 mb-4">
              <ShieldCheck className="w-7 h-7 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">
              Create First Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Bootstrap the initial administrator account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. John Smith"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@babcock.edu.ng"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="border-t border-gray-100 pt-4">
              <Input
                label="Bootstrap Key"
                type="password"
                placeholder="Server-side secret"
                error={errors.bootstrapKey?.message}
                {...register('bootstrapKey')}
              />
              <p className="mt-1 text-xs text-gray-400">
                The value set via{' '}
                <code className="bg-gray-100 px-1 rounded">
                  firebase functions:secrets:set BOOTSTRAP_SECRET
                </code>
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
                className="py-3 font-semibold"
              >
                {isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login/admin" className="text-[var(--color-primary)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
