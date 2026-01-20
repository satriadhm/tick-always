'use client';

import { ButtonHTMLAttributes, ReactNode, useState } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const textColors = {
    primary: '#4a5568',
    secondary: '#6b6b6b',
    danger: '#ce6b6b',
    ghost: '#6b6b6b',
  };

  // Shadow styles
  const raisedShadow = '6px 6px 12px #bebebe, -6px -6px 12px #ffffff';
  const hoverShadow = '4px 4px 8px #bebebe, -4px -4px 8px #ffffff';
  const pressedShadow = 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff';
  const ghostShadow = 'none';
  const ghostHoverShadow = '3px 3px 6px #bebebe, -3px -3px 6px #ffffff';

  const getShadow = () => {
    if (variant === 'ghost') {
      if (isPressed) return pressedShadow;
      if (isHovered) return ghostHoverShadow;
      return ghostShadow;
    }
    if (isPressed) return pressedShadow;
    if (isHovered) return hoverShadow;
    return raisedShadow;
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: variant === 'ghost' && !isHovered 
      ? 'transparent' 
      : variant === 'primary' 
        ? '#d8dfe8' // Subtle blue tint
        : variant === 'danger'
          ? '#e8d8d8' // Subtle red tint
          : '#e0e0e0',
    boxShadow: getShadow(),
    color: textColors[variant],
    fontWeight: variant === 'primary' ? 600 : 500,
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.5 : 1,
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <button
      className={`
        rounded-2xl
        outline-none
        ${sizes[size]} 
        ${className}
      `}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
