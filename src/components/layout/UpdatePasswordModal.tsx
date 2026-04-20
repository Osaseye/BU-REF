import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  if (!isOpen) return null;

  const onSubmit = (data: PasswordFormData) => {
    console.log('Update password:', data);
    toast.success('Password updated successfully');
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-in zoom-in-95">
        <h2 className="text-xl font-bold font-serif text-[var(--color-text-primary)] mb-1">Update Password</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Please enter your current and new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Current Password" 
            type="password" 
            autoComplete="current-password"
            placeholder="••••••••" 
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
          />
          <Input 
            label="New Password" 
            type="password" 
            autoComplete="new-password"
            placeholder="Min 8 characters..." 
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            autoComplete="new-password"
            placeholder="Min 8 characters..." 
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
