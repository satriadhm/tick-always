'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      boxShadow: 'var(--neu-inset)',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      ...style,
    };

    const focusedStyle: React.CSSProperties = {
      boxShadow: 'var(--neu-inset), 0 0 0 2px var(--accent-primary)',
    };

    const errorStyle: React.CSSProperties = {
      boxShadow: 'var(--neu-inset), 0 0 0 2px var(--accent-danger)',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 transition-colors">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            bg-[var(--bg-base)] 
            text-[var(--text-primary)]
            rounded-2xl
            border-none
            outline-none
            placeholder:text-[var(--text-muted)]
            transition-all duration-200
            focus:outline-none
            ${className}
          `}
          style={error ? errorStyle : baseStyle}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = focusedStyle.boxShadow as string;
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.boxShadow = baseStyle.boxShadow as string;
            }
          }}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--accent-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
