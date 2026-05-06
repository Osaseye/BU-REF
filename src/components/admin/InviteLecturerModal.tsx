import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const BABCOCK_SCHOOLS = [
  'Basic & Applied Sciences',
  'Communication & Media Studies',
  'Computing & Applied Sciences',
  'Engineering',
  'Environmental Sciences',
  'Health Sciences',
  'Law',
  'Management Sciences',
  'Postgraduate School',
  'Social & Management Sciences',
] as const;

// Mock modal component, replace with Radix UI Dialog or similar later
interface InviteLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteFormData) => void;
}

const inviteSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  school: z.string().min(1, 'School / Faculty is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type InviteFormData = z.infer<typeof inviteSchema>;

export const InviteLecturerModal: React.FC<InviteLecturerModalProps> = ({ isOpen, onClose, onInvite }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema)
  });

  if (!isOpen) return null;

  const onSubmit = (data: InviteFormData) => {
    onInvite(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-in zoom-in-95">
        <h2 className="text-xl font-bold font-serif text-[var(--color-text-primary)] mb-1">Create New Account</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Create an account for the lecturer. Secure credentials will be shared with the staff member.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="Dr. Jane Doe" 
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="jane.doe@babcock.edu.ng" 
            {...register('email')}
            error={errors.email?.message}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">School / Faculty</label>
            <select
              {...register('school')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              <option value="">— Select a school —</option>
              {BABCOCK_SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.school && (
              <span className="text-xs text-red-500">{errors.school.message}</span>
            )}
          </div>

          <Input 
            label="Initial Password" 
            type="password" 
            placeholder="Min 8 characters..." 
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Create Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
