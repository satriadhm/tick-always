'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Real State
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock Preferences
  const [preferences, setPreferences] = useState({
    startOfWeek: 'monday',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setProfile(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#4a4a4a] dark:text-[#e0e0e0] mb-2 transition-colors">Settings</h1>
        <p className="text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Manage your account preferences and app settings</p>
      </header>

      {/* Profile Settings */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] dark:text-[#e0e0e0] mb-4 transition-colors">Profile</h2>
        <Card className="space-y-6">
          <div className="flex items-center gap-6">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-24 h-24 rounded-full shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3d3d3d] object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#e0e0e0] dark:bg-[#2d2d2d] flex items-center justify-center text-3xl font-bold text-[#6b6b6b] dark:text-[#a0a0a0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#3d3d3d] transition-all">
                {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="space-y-2">
              <Button variant="secondary" size="sm" disabled>Google Account Managed</Button>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6b6b6b] transition-colors">
                Profile picture and info managed via Google
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Display Name" 
              value={profile.name} 
              disabled
              readOnly
            />
            <Input 
              label="Email Address" 
              value={profile.email} 
              disabled
              readOnly
            />
          </div>
        </Card>
      </section>

      {/* App Preferences */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] dark:text-[#e0e0e0] mb-4 transition-colors">Preferences</h2>
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a] dark:text-[#e0e0e0] transition-colors">Dark Mode</h3>
              <p className="text-sm text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Switch between light and dark themes</p>
            </div>
            {mounted && (
              <Switch 
                checked={isDark || false}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
              />
            )}
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#bebebe] dark:via-[#3d3d3d] to-transparent opacity-50 my-4" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a] dark:text-[#e0e0e0] transition-colors">Start of Week</h3>
              <p className="text-sm text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Choose which day your week starts on</p>
            </div>
            <div className="relative">
              <select 
                value={preferences.startOfWeek}
                onChange={(e) => setPreferences({ ...preferences, startOfWeek: e.target.value })}
                className="appearance-none bg-[var(--bg-base)] text-[var(--text-primary)] px-4 py-2 pr-8 rounded-xl shadow-[var(--neu-inset)] outline-none cursor-pointer transition-all focus:ring-2 focus:ring-[var(--accent-primary)]/50"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
          </div>
        </Card>
      </section>

      {/* Notification Settings */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] dark:text-[#e0e0e0] mb-4 transition-colors">Notifications</h2>
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a] dark:text-[#e0e0e0] transition-colors">Email Notifications</h3>
              <p className="text-sm text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Receive updates about your tasks via email</p>
            </div>
            <Switch 
              checked={notifications.email} 
              onChange={(checked) => setNotifications({ ...notifications, email: checked })} 
            />
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#bebebe] dark:via-[#3d3d3d] to-transparent opacity-50 my-4" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a] dark:text-[#e0e0e0] transition-colors">Push Notifications</h3>
              <p className="text-sm text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Receive push notifications on your device</p>
            </div>
            <Switch 
              checked={notifications.push} 
              onChange={(checked) => setNotifications({ ...notifications, push: checked })} 
            />
          </div>
        </Card>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-xl font-semibold text-[#ce6b6b] mb-4">Danger Zone</h2>
        <Card className="border border-[#ce6b6b]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a] dark:text-[#e0e0e0] transition-colors">Delete Account</h3>
              <p className="text-sm text-[#6b6b6b] dark:text-[#a0a0a0] transition-colors">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger">Delete Account</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
