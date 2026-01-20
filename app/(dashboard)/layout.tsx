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
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        // Not authenticated - redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen bg-[#e0e0e0] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-[#e0e0e0]"
            style={{ 
              boxShadow: '-3px -3px 6px #ffffff, 3px 3px 6px #bebebe' 
            }}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#6b8cce] border-t-transparent"></div>
          </div>
          <p className="mt-4 text-[#6b6b6b]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#e0e0e0] overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-[#e0e0e0]">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
