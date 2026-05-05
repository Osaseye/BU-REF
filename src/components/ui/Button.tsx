import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)]',
    secondary: 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-white focus:ring-[var(--color-primary)]',
    danger: 'bg-[var(--color-danger)] text-white hover:bg-[#A93226] focus:ring-[var(--color-danger)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-text-primary)] bg-white hover:bg-gray-50 focus:ring-gray-200',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
