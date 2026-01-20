'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'subtle';
}

export default function Card({ children, className = '', variant = 'raised' }: CardProps) {
  const getShadow = () => {
    switch (variant) {
      case 'raised': return 'var(--neu-raised)';
      case 'inset': return 'var(--neu-inset)';
      case 'subtle': return 'var(--neu-subtle)';
      default: return 'var(--neu-raised)';
    }
  };

  return (
    <div 
      className={`rounded-3xl p-8 bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200 ${className}`}
      style={{ boxShadow: getShadow() }}
    >
      {children}
    </div>
  );
}
