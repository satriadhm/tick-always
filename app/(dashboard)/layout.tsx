'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ... (useCallback remains)

  // ... (useEffect remains)

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-[var(--bg-base)]"
            style={{ 
              boxShadow: 'var(--neu-raised)' 
            }}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      <Sidebar 
        user={user} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      <main 
        className={`
          flex-1 overflow-y-auto bg-[var(--bg-base)] transition-all duration-300
          ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-[260px]'}
          ml-0
        `}
      >
        <div className="min-h-full">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 mb-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[var(--text-primary)] rounded-lg"
              style={{ boxShadow: 'var(--neu-raised)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Tick Always</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          <div className="p-4 pt-0 md:p-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
