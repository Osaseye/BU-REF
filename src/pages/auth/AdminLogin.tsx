import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '../../lib/firebase';
import { getAuthErrorMessage } from '../../lib/authErrors';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const adminSnap = await getDoc(doc(db, 'admins', uid));
      if (!adminSnap.exists()) {
        await auth.signOut();
        throw new Error('Access denied. No admin account found for this user.');
      }

      toast.success('Welcome back, Admin.');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(getAuthErrorMessage(err, 'Invalid credentials'));
      auth.signOut();
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="inline-flex justify-center items-center w-12 h-12 bg-red-50 text-red-600 rounded-xl mb-4 sm:hidden shadow-sm border border-red-100">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--color-primary)]">
          <ShieldCheck className="w-5 h-5 hidden sm:block text-red-600" />
          Admin Portal
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Secure access for system administrators
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="relative">
          <div className="absolute top-8 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 z-10" />
          </div>
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@babcock.edu.ng"
            error={errors.email?.message}
            className="pl-10"
            {...register('email')}
          />
        </div>
        
        <div className="relative">
          <div className="absolute top-8 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 z-10" />
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="pl-10"
            {...register('password')}
          />
        </div>

        <div className="pt-2">
          <Button 
            className="w-full py-3.5 text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-red-700 hover:from-[var(--color-primary-dark)] hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </div>
      </form>
      
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>
    </div>
  );
};
