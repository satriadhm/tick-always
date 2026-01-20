'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function Header() {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-[#e0e0e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/tasks" 
              className="text-xl font-bold text-[#4a4a4a] hover:text-[#6b8cce] transition-colors"
            >
              Tick Always
            </Link>
            <nav className="hidden md:flex space-x-2">
              {['Tasks', 'Calendar', 'Habits'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="
                    text-[#6b6b6b] px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    hover:text-[#4a4a4a]
                    hover:bg-[#e0e0e0]
                    hover:shadow-[
                      -2px_-2px_4px_rgba(255,255,255,0.8),
                      2px_2px_4px_rgba(190,190,190,0.8)
                    ]
                  "
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && user && (
              <span className="text-sm text-[#6b6b6b] font-medium">{user.name}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
