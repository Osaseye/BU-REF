import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const staffLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type StaffLoginFormData = z.infer<typeof staffLoginSchema>;

export const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (data: StaffLoginFormData) => {
    // Placeholder login logic until AuthContext is implemented
    console.log('Staff Login:', data);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/lecturer/dashboard'); // Assuming a successful path
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Staff Portal</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Authorized Lecturers and Administrators only
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@babcock.edu.ng"
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

        <div className="pt-2">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Are you a Student?{' '}
          <Link to="/login/student" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
            Student Login
          </Link>
        </p>
      </div>
    </div>
  );
};
