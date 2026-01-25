'use client';

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
  // Neumorphic styles
  const switchContainerStyle: React.CSSProperties = {
    backgroundColor: '#e0e0e0',
    boxShadow: checked
      ? 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff' // Pressed/Active state
      : 'inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff', // Always inset for the track
    transition: 'all 0.3s ease',
  };

  const toggleStyle: React.CSSProperties = {
    backgroundColor: checked ? '#6b8cce' : '#e0e0e0', // Blue when checked, gray when unchecked
    boxShadow: checked
      ? '3px 3px 6px #bebebe, -3px -3px 6px #ffffff' // Raised when checked
      : '3px 3px 6px #bebebe, -3px -3px 6px #ffffff', // Raised when unchecked
    transform: checked ? 'translateX(24px)' : 'translateX(0)',
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
  };

  const indicatorStyle: React.CSSProperties = {
    backgroundColor: checked ? '#ffffff' : '#8a8a8a', // White dot when checked, gray when unchecked
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
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
