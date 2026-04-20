import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// The schema only contains fields the student is allowed to edit.
const profileFormSchema = z.object({
  projectTitle: z.string().optional(),
  supervisorName: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  linkedInURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, /* isSubmitting, isDirty */ },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData || {
      projectTitle: '',
      supervisorName: '',
      contactEmail: '',
      phoneNumber: '',
      linkedInURL: '',
      bio: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Project Title"
          placeholder="e.g. AI-driven Reference System"
          error={errors.projectTitle?.message}
          {...register('projectTitle')}
        />
        <Input
          label="Supervisor Name"
          placeholder="e.g. Dr. John Doe"
          error={errors.supervisorName?.message}
          {...register('supervisorName')}
        />
        <Input
          label="Contact Email"
          type="email"
          placeholder="your.personal@email.com"
          error={errors.contactEmail?.message}
          {...register('contactEmail')}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+234..."
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <Input
          label="LinkedIn URL"
          type="url"
          placeholder="https://linkedin.com/in/username"
          error={errors.linkedInURL?.message}
          {...register('linkedInURL')}
        />
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
          Short Bio
        </label>
        <textarea
          className={`w-full border rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 text-[var(--color-text-primary)] 
            ${errors.bio ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20' : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20'}`}
          rows={4}
          placeholder="Tell us a little about your academic journey..."
          {...register('bio')}
        />
        {errors.bio && (
          <span className="text-xs text-[var(--color-danger)] mt-0.5">{errors.bio.message}</span>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--color-border)] pt-4">
        {/* We would use `isSubmitting` and `isDirty` here normally to disable */}
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
