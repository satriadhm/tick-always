'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
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
  };

  return (
    <div className="flex h-screen bg-[#F7F7F7] overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 ml-[260px] overflow-y-auto bg-[#F7F7F7]">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}

