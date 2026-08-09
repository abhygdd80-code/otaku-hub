'use client';

import type { ReactNode } from 'react';

interface AuthInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * Styled form input with label, icon support, and error state.
 * Designed for auth forms with consistent spacing and accessibility.
 */
export function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required = true,
  disabled = false,
  icon,
}: AuthInputProps) {
  const id = `auth-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-primary"
      >
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-4 py-3 rounded-xl bg-background border text-sm
            text-primary placeholder-muted transition-colors
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-destructive focus:ring-destructive/50 focus:border-destructive' : 'border-border'}
          `}
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-destructive mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
