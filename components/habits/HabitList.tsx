'use client';

import { useState, useEffect, useCallback } from 'react';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';
import HabitDetailPanel from './HabitDetailPanel';

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: { type: string; daysOfWeek: string[] };
  color: string;
  icon?: string;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
}

export default function HabitList() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/habits', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setHabits(data.data.habits);
      } else {
        setError(data.error || 'Failed to fetch habits');
      }
    } catch {
      setError('Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggleComplete = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed }),
      });
      const data = await response.json();
      if (data.success) {
        // Update local state
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId
              ? { ...h, completedToday: completed, currentStreak: data.data.currentStreak }
              : h
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      throw err;
    }
  };

  const handleAddHabit = async (habitData: {
    name: string;
    description?: string;
    frequency?: { type: string; daysOfWeek: string[] };
    color?: string;
    icon?: string;
  }) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(habitData),
      });
      const data = await response.json();
      if (data.success) {
        setHabits((prev) => [data.data.habit, ...prev]);
        setShowAddModal(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to create habit:', err);
      throw err;
    }
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-200 ${selectedHabitId ? 'mr-[400px]' : ''}`}>
        <div className="max-w-[700px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#4a4a4a]">Habits</h1>
              {totalCount > 0 && (
                <p className="text-sm text-[#8a8a8a] mt-1">
                  {completedCount} of {totalCount} completed today
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#6b8cce] transition-all duration-200"
              style={{
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
              }}
            >
              + New Habit
            </button>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div 
              className="mb-6 rounded-xl p-4 bg-[#e0e0e0]"
              style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6b6b6b]">Today&apos;s Progress</span>
                <span className="text-sm font-medium text-[#4a4a4a]">
                  {Math.round((completedCount / totalCount) * 100)}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full bg-[#e0e0e0] overflow-hidden"
                style={{ boxShadow: 'inset -1px -1px 2px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(190,190,190,0.6)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                    backgroundColor: '#6b8cce',
                    boxShadow: completedCount > 0 ? 'inset 0 -1px 1px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-12">
              <div
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-[#e0e0e0]"
                style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.9), 3px 3px 6px rgba(190,190,190,0.9)' }}
              >
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#6b8cce] border-t-transparent"></div>
              </div>
              <p className="mt-4 text-sm text-[#6b6b6b]">Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-[#e0e0e0] mb-4"
                style={{ boxShadow: '-4px -4px 8px rgba(255,255,255,0.9), 4px 4px 8px rgba(190,190,190,0.9)' }}
              >
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-medium text-[#4a4a4a] mb-2">No habits yet</h3>
              <p className="text-sm text-[#8a8a8a] mb-4">
                Start building better routines by creating your first habit
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#6b8cce] bg-[#e0e0e0] transition-all duration-200"
                style={{
                  boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
                }}
              >
                Create First Habit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleComplete={handleToggleComplete}
                  onClick={(id) => setSelectedHabitId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedHabitId && (
        <HabitDetailPanel
          habitId={selectedHabitId}
          onClose={() => setSelectedHabitId(null)}
          onUpdate={fetchHabits}
          onDelete={() => {
            setSelectedHabitId(null);
            fetchHabits();
          }}
        />
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddHabit}
        />
      )}
    </div>
  );
}
