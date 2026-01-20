'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'subtle';
}

export default function Card({ children, className = '', variant = 'raised' }: CardProps) {
  const shadows = {
    raised: '8px 8px 16px #bebebe, -8px -8px 16px #ffffff',
    inset: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
    subtle: '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
  };

  return (
    <div 
      className={`rounded-3xl p-8 bg-[#e0e0e0] ${className}`}
      style={{ boxShadow: shadows[variant] }}
    >
      {children}
    </div>
  );
}
