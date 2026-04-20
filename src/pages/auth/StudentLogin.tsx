import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const studentLoginSchema = z.object({
  matricNo: z.string().regex(/^\d{2}\/\d{4}$/, 'Matric Number must be in the format YY/XXXX (e.g., 22/0206)'),
  password: z.string().min(1, 'Password is required'),
});

type StudentLoginFormData = z.infer<typeof studentLoginSchema>;

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentLoginFormData>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginFormData) => {
    // Placeholder login logic until useUmisAuth hook is implemented
    console.log('Student Login:', data);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/student/profile'); // Assuming a successful path
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Student Portal</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Sign in using your UMIS credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Matric Number"
          placeholder="e.g. 22/0206"
          error={errors.matricNo?.message}
          {...register('matricNo', {
            onChange: (e) => {
              // Only allow digits and a single slash
              let val = e.target.value.replace(/[^\d/]/g, '');
              
              // Automatically insert slash if the user types past two digits
              if (val.length === 3 && val[2] !== '/' && !val.includes('/')) {
                val = val.slice(0, 2) + '/' + val.slice(2);
              }
              
              // Ensure only one slash and a maximum length of 7 (e.g. 22/0206)
              const parts = val.split('/');
              if (parts.length > 2) {
                val = parts[0] + '/' + parts.slice(1).join('');
              }
              if (parts.length === 2) {
                val = parts[0].slice(0, 2) + '/' + parts[1].slice(0, 4);
              } else if (parts.length === 1) {
                 val = parts[0].slice(0, 2);
              }
              
              e.target.value = val;
            }
          })}
        />
        
        <Input
          label="UMIS Password"
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
          Are you a Lecturer or Admin?{' '}
          <Link to="/login/staff" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
            Staff Login
          </Link>
        </p>
      </div>
    </div>
  );
};
