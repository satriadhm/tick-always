'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', style, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
      ...style,
    };

    const focusedStyle: React.CSSProperties = {
      boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(107,140,206,0.5)',
    };

    const errorStyle: React.CSSProperties = {
      boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff, 0 0 0 2px rgba(206,107,107,0.5)',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            bg-[#e0e0e0] 
            text-[#4a4a4a]
            rounded-2xl
            border-none
            outline-none
            placeholder:text-[#8a8a8a]
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
          <p className="mt-2 text-sm text-[#ce6b6b]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
