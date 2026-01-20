'use client';

import { useState, useEffect } from 'react';
import HabitCalendarHeatmap from './HabitCalendarHeatmap';

interface HabitDetailPanelProps {
  habitId: string;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

interface HabitData {
  id: string;
  name: string;
  description?: string;
  frequency: { type: string; daysOfWeek: string[] };
  color: string;
  icon?: string;
  currentStreak: number;
  bestStreak: number;
}

interface StatsData {
  totalDays: number;
  completedDays: number;
  completionRate: number;
}

export default function HabitDetailPanel({
  habitId,
  onClose,
  onUpdate,
  onDelete,
}: HabitDetailPanelProps) {
  const [habit, setHabit] = useState<HabitData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [completionsByDate, setCompletionsByDate] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  const fetchHabitData = async () => {
    setIsLoading(true);
    try {
      // Fetch habit and stats
      const [habitRes, statsRes] = await Promise.all([
        fetch(`/api/habits/${habitId}`, { credentials: 'include' }),
        fetch(`/api/habits/${habitId}/stats?days=90`, { credentials: 'include' }),
      ]);

      const habitData = await habitRes.json();
      const statsData = await statsRes.json();

      if (habitData.success) {
        setHabit(habitData.data.habit);
        setEditName(habitData.data.habit.name);
        setEditDescription(habitData.data.habit.description || '');
      }

      if (statsData.success) {
        setStats(statsData.data.stats);
        setCompletionsByDate(statsData.data.completionsByDate);
      }
    } catch (error) {
      console.error('Failed to fetch habit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setHabit(data.data.habit);
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  if (isLoading) {
    return (
      <div
        className="fixed right-0 top-0 h-full w-[400px] bg-[#e0e0e0] z-50 p-6 flex items-center justify-center"
        style={{ boxShadow: '-8px 0 16px rgba(190,190,190,0.5)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#e0e0e0]"
          style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.9), 3px 3px 6px rgba(190,190,190,0.9)' }}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#6b8cce] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  return (
    <div
      className="fixed right-0 top-0 h-full w-[400px] bg-[#e0e0e0] z-50 overflow-y-auto animate-in slide-in-from-right duration-200"
      style={{ boxShadow: '-8px 0 16px rgba(190,190,190,0.5)' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#e0e0e0] px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-[#4a4a4a]">Habit Details</h2>
        <button
          onClick={onClose}
          className="p-2 text-[#6b6b6b] rounded-xl transition-all duration-200 bg-[#e0e0e0] hover:text-[#4a4a4a]"
          style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 h-0.5 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />

      <div className="p-6 space-y-6">
        {/* Habit Info */}
        <div
          className="rounded-xl p-4 bg-[#e0e0e0]"
          style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)' }}
        >
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#e0e0e0] text-[#4a4a4a] outline-none"
                style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-lg bg-[#e0e0e0] text-[#4a4a4a] placeholder-[#8a8a8a] outline-none resize-none"
                style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-[#6b6b6b] bg-[#e0e0e0]"
                  style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 rounded-lg text-sm text-white"
                  style={{ backgroundColor: habit.color, boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                {habit.icon && <span className="text-xl">{habit.icon}</span>}
                <h3 className="text-lg font-semibold text-[#4a4a4a]">{habit.name}</h3>
              </div>
              {habit.description && (
                <p className="text-sm text-[#6b6b6b]">{habit.description}</p>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 text-sm text-[#6b8cce] hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Current Streak" value={habit.currentStreak} suffix="days" color={habit.color} icon="🔥" />
          <StatCard label="Best Streak" value={habit.bestStreak} suffix="days" color={habit.color} icon="⭐" />
          <StatCard label="Completion" value={stats?.completionRate || 0} suffix="%" color={habit.color} icon="📊" />
        </div>

        {/* Calendar Heatmap */}
        <div
          className="rounded-xl p-4 bg-[#e0e0e0]"
          style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)' }}
        >
          <h4 className="text-sm font-medium text-[#6b6b6b] mb-4">Completion History</h4>
          <HabitCalendarHeatmap
            habitId={habitId}
            color={habit.color}
            completionsByDate={completionsByDate}
          />
        </div>

        {/* Delete Button */}
        <div className="pt-4">
          <div className="h-0.5 mb-4 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />
          <button
            onClick={handleDelete}
            className="w-full text-[#ce6b6b] p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-[#e0e0e0]"
            style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Habit
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  label: string;
  value: number;
  suffix: string;
  color: string;
  icon: string;
}

function StatCard({ label, value, suffix, icon }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-3 bg-[#e0e0e0] text-center"
      style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xl font-bold text-[#4a4a4a]">{value}</div>
      <div className="text-xs text-[#8a8a8a]">{suffix}</div>
      <div className="text-xs text-[#6b6b6b] mt-1">{label}</div>
    </div>
  );
}
