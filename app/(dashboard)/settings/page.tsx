'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock Preferences State
  const [preferences, setPreferences] = useState({
    startOfWeek: 'monday',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    // Optimistic update
    setNotifications(prev => ({ ...prev, [key]: value }));

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: { [key]: value }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Update local state when user data is loaded
  useEffect(() => {
    if (user?.preferences?.notifications) {
      setNotifications(user.preferences.notifications);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6b8cce] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">Settings</h1>
        <p className="text-[#6b6b6b]">Manage your account preferences and app settings</p>
      </header>

      {/* Profile Settings */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">Profile</h2>
        <Card className="space-y-6">
          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-full bg-[#e0e0e0] flex items-center justify-center text-3xl font-bold text-[#6b6b6b] overflow-hidden"
              style={{ boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg text-[#4a4a4a]">{user?.name}</h3>
              <p className="text-sm text-[#8a8a8a]">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Display Name" 
              value={user?.name || ''} 
              disabled
              readOnly
            />
            <Input 
              label="Email Address" 
              value={user?.email || ''} 
              disabled
              readOnly
            />
          </div>
          
          <div className="flex justify-end">
             {/* Edit functionality to be implemented */}
             <Button disabled>Save Changes</Button>
          </div>
        </Card>
      </section>

      {/* App Preferences */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">Preferences</h2>
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a]">Start of Week</h3>
              <p className="text-sm text-[#6b6b6b]">Choose which day your week starts on</p>
            </div>
            <div className="relative">
              <select 
                value={preferences.startOfWeek}
                onChange={(e) => setPreferences({ ...preferences, startOfWeek: e.target.value })}
                className="appearance-none bg-[#e0e0e0] px-4 py-2 pr-8 rounded-xl shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] text-[#4a4a4a] outline-none cursor-pointer"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="saturday">Saturday</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6b6b6b]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Notification Settings */}
      <section>
        <h2 className="text-xl font-semibold text-[#4a4a4a] mb-4">Notifications</h2>
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a]">Email Notifications</h3>
              <p className="text-sm text-[#6b6b6b]">Receive updates about your tasks via email</p>
            </div>
            <Switch 
              checked={notifications.email} 
              onChange={(checked) => handleNotificationChange('email', checked)} 
            />
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#bebebe] to-transparent opacity-50 my-4" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a]">Push Notifications</h3>
              <p className="text-sm text-[#6b6b6b]">Receive push notifications on your device</p>
            </div>
            <Switch 
              checked={notifications.push} 
              onChange={(checked) => handleNotificationChange('push', checked)} 
            />
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#bebebe] to-transparent opacity-50 my-4" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#4a4a4a]">Marketing Emails</h3>
              <p className="text-sm text-[#6b6b6b]">Receive news and tips about Tick Always</p>
            </div>
            <Switch 
              checked={notifications.marketing} 
              onChange={(checked) => handleNotificationChange('marketing', checked)} 
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
              <h3 className="text-base font-medium text-[#4a4a4a]">Delete Account</h3>
              <p className="text-sm text-[#6b6b6b]">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger">Delete Account</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
