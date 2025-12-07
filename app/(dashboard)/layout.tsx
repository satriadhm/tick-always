'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }, []);

  useEffect(() => {
    // Avoid calling an async function directly within useEffect.
    // Use an inner async function and call it.
    const getUser = async () => {
      await fetchUser();
    };
    getUser();
    // If fetchUser never changes, you may pass [] to avoid confusion.
  }, [fetchUser]);

  return (
    <div className="flex h-screen bg-[#F7F7F7] overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 ml-[260px] overflow-y-auto bg-[#F7F7F7]">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}

