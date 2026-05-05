import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'revoked' | 'gold' | 'success' | 'error' | 'warning' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variants = {
    active: 'bg-[var(--color-primary-muted)] text-[var(--color-primary)]',
    revoked: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    gold: 'bg-[var(--color-gold-light)] text-[var(--color-gold)] font-semibold',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-amber-100 text-amber-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
