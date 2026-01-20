'use client';

import { useState } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  className = '',
}: SwitchProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Neumorphic styles
  const switchContainerStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-base)',
    boxShadow: 'var(--neu-inset)',
    transition: 'all 0.3s ease',
  };

  const toggleStyle: React.CSSProperties = {
    backgroundColor: checked ? 'var(--accent-primary)' : 'var(--bg-base)',
    boxShadow: checked
      ? 'var(--neu-raised)' // Adjusted
      : 'var(--neu-raised)',
    transform: checked ? 'translateX(24px)' : 'translateX(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
  };

  const indicatorStyle: React.CSSProperties = {
    backgroundColor: checked ? '#ffffff' : 'var(--text-muted)',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      className={`
        relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
        focus-visible:ring-blue-500 focus-visible:ring-opacity-75
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
      style={switchContainerStyle}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-7 w-7 transform rounded-full ring-0 
          shadow-lg transition duration-200 ease-in-out flex items-center justify-center
          -mt-[2px] -ml-[2px]
        `}
        style={toggleStyle}
      >
        {/* Optional: Small indicator light/dot inside the toggle */}
        <span 
          className="block h-2 w-2 rounded-full transition-colors duration-200"
          style={indicatorStyle}
        />
      </span>
    </button>
  );
}
