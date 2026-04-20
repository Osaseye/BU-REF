import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', type, disabled, readOnly, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseStyles = 'w-full border rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 text-[var(--color-text-primary)]';
    
    // Determine the style state
    const standardStyles = 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 bg-white';
    const errorStyles = 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20 bg-white';
    const readOnlyStyles = 'bg-gray-50 border-[var(--color-border)] text-[var(--color-text-secondary)] cursor-not-allowed focus:ring-0';
    
    let inputStyles = `${baseStyles} `;
    
    if (readOnly || disabled) {
      inputStyles += readOnlyStyles;
    } else if (error) {
      inputStyles += errorStyles;
    } else {
      inputStyles += standardStyles;
    }

    return (
      <div className="flex flex-col gap-1.5 w-full relative">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            readOnly={readOnly}
            className={`${inputStyles} ${isPassword ? 'pr-10' : ''} ${leftIcon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-[var(--color-danger)] mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
