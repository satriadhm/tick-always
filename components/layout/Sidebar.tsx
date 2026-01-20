'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  user?: { name: string; email: string } | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export default function Sidebar({ 
  user, 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const navigationItems = [
    { name: 'Today', href: '/tasks?filter=today', icon: 'today', exact: false },
    { name: 'Next 7 Days', href: '/tasks?filter=week', icon: 'week', exact: false },
    { name: 'Calendar', href: '/calendar', icon: 'calendar', exact: true },
    { name: 'Habits', href: '/habits', icon: 'habits', exact: true },
  ];

  const getIcon = (iconName: string) => {
    // ... (icon logic remains same, omitting for brevity if I could, but replace_file_content needs contiguity. I'll include it)
    const iconClass = 'w-5 h-5';
    switch (iconName) {
      case 'today':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'week':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'habits':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isActive = (href: string, exact: boolean = false) => {
    const [path, query] = href.split('?');
    
    if (exact) {
      if (pathname !== path) return false;
      if (query) {
        const filter = searchParams.get('filter');
        return query.includes(`filter=${filter}`);
      }
      return !searchParams.toString();
    } else {
      if (!pathname.startsWith(path)) return false;
      if (query) {
        const filter = searchParams.get('filter');
        return query.includes(`filter=${filter}`);
      }
      return pathname === path;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      
      <aside
        className={`
          bg-[var(--bg-base)] h-screen fixed left-0 top-0 z-40 
          transition-transform duration-300 md:translate-x-0
          ${isCollapsed ? 'md:w-16 w-[260px]' : 'w-[260px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ 
          boxShadow: 'var(--neu-raised)' 
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 justify-between md:justify-start">
            {!isCollapsed ? (
              <Link href="/tasks" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-base)]"
                  style={{ boxShadow: 'var(--neu-raised)' }}
                >
                  <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-[var(--text-primary)]">Tick Always</span>
              </Link>
            ) : (
              <Link href="/tasks" className="flex items-center justify-center w-full hover:opacity-80 transition-opacity hidden md:flex">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-base)]"
                  style={{ boxShadow: 'var(--neu-raised)' }}
                >
                  <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </Link>
            )}
            
            {/* Mobile Close Button */}
            <button 
              className="md:hidden p-2 text-[var(--text-secondary)]"
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 h-0.5 bg-gradient-to-r from-transparent via-[var(--shadow-dark)] to-transparent rounded-full opacity-20" />

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-4 space-y-2">
              {navigationItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    active={active}
                    icon={getIcon(item.icon)}
                    label={item.name}
                    isCollapsed={isCollapsed}
                    onClick={() => setIsMobileOpen(false)} // Close on nav
                  />
                );
              })}
            </div>

            {/* Lists Section */}
            {!isCollapsed && (
              <div className="mt-8 px-4">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-4">
                  Lists
                </h3>
                <div className="space-y-1">
                  <div className="text-sm text-[var(--text-muted)] px-4 py-2">No custom lists yet</div>
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4">
            {/* Divider */}
            <div className="mb-4 h-0.5 bg-gradient-to-r from-transparent via-[var(--shadow-dark)] to-transparent rounded-full opacity-20" />
            
            {!isCollapsed && user && (
              <div className="mb-4">
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-base)]"
                  style={{ boxShadow: 'var(--neu-raised)' }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--accent-primary)] text-sm font-semibold flex-shrink-0 bg-[var(--bg-base)]"
                    style={{ boxShadow: 'var(--neu-inset)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              {!isCollapsed && (
                <>
                  <SidebarButton onClick={() => {
                    router.push('/settings');
                    setIsMobileOpen(false);
                  }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </SidebarButton>
                  <SidebarButton onClick={handleLogout} hoverColor="var(--accent-danger)">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </SidebarButton>
                </>
              )}
              {/* Hide collapse button on mobile */}
              <div className="hidden md:block">
                <CollapseButton isCollapsed={isCollapsed} onClick={() => setIsCollapsed(!isCollapsed)} />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// NavLink component with neumorphic styling
interface NavLinkProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

function NavLink({ href, active, icon, label, isCollapsed }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getShadow = () => {
    if (active) {
      return 'var(--neu-inset)'; // Active state
    }
    if (isHovered) {
      return 'var(--neu-subtle)'; // Hover state
    }
    return 'none';
  };

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
        ${active ? 'text-[var(--accent-primary)] font-medium bg-[var(--bg-base)]' : 'text-[var(--text-secondary)]'}
        ${isHovered && !active ? 'text-[var(--text-primary)] bg-[var(--bg-base)]' : ''}
      `}
      style={{ boxShadow: getShadow() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
}

// SidebarButton component
interface SidebarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  hoverColor?: string;
}

function SidebarButton({ children, onClick, hoverColor = 'var(--text-primary)' }: SidebarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200`}
      style={{ 
        boxShadow: isHovered ? 'var(--neu-subtle)' : 'none',
        color: isHovered ? hoverColor : 'var(--text-muted)',
        backgroundColor: isHovered ? 'var(--bg-base)' : 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}

// CollapseButton component
interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

function CollapseButton({ isCollapsed, onClick }: CollapseButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getShadow = () => {
    if (isHovered) {
      return 'var(--neu-subtle)';
    }
    return 'var(--neu-raised)';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-full px-3 py-2.5 text-sm text-[var(--text-muted)] rounded-xl transition-all duration-200 bg-[var(--bg-base)]`}
      style={{ boxShadow: getShadow() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>
  );
}
