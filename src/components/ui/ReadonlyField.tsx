import React from 'react';
import { Lock } from 'lucide-react';

interface ReadonlyFieldProps {
  label: string;
  value: string | number;
}

export const ReadonlyField: React.FC<ReadonlyFieldProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
        {label}
        <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
      </label>
      <div className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 bg-gray-50 text-[var(--color-text-secondary)] cursor-not-allowed">
        {value || 'N/A'}
      </div>
    </div>
  );
};
