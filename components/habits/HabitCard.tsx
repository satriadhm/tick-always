'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    currentStreak: number;
    completedToday: boolean;
  };
  weeklyData?: { date: string; completed: boolean }[];
  onToggleComplete: (habitId: string, completed: boolean) => Promise<void>;
  onClick?: (habitId: string) => void;
}

export default function HabitCard({
  habit,
  weeklyData,
  onToggleComplete,
  onClick,
}: HabitCardProps) {
  const [isCompleted, setIsCompleted] = useState(habit.completedToday);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate default weekly data if not provided
  const displayWeekly = weeklyData || generateDefaultWeekly(isCompleted);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted); // Optimistic update

    try {
      await onToggleComplete(habit.id, newCompleted);
    } catch {
      setIsCompleted(!newCompleted); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const getShadow = () => {
    if (isHovered) {
      return '-5px -5px 10px rgba(255,255,255,0.95), 5px 5px 10px rgba(190,190,190,0.95)';
    }
    return '-4px -4px 8px rgba(255,255,255,0.9), 4px 4px 8px rgba(190,190,190,0.9)';
  };

  return (
    <div
      className="rounded-2xl p-4 bg-[#e0e0e0] cursor-pointer transition-all duration-200"
      style={{ boxShadow: getShadow() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(habit.id)}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isLoading ? 'opacity-50' : ''
          }`}
          style={{
            backgroundColor: isCompleted ? habit.color : '#e0e0e0',
            boxShadow: isCompleted
              ? 'inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.3)'
              : 'inset -2px -2px 4px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(190,190,190,0.9)',
          }}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {habit.icon && <span className="text-lg">{habit.icon}</span>}
            <h3 className={`text-[15px] font-medium text-[#4a4a4a] ${isCompleted ? 'line-through opacity-60' : ''}`}>
              {habit.name}
            </h3>
          </div>
          {habit.description && (
            <p className="text-xs text-[#8a8a8a] mt-0.5 truncate">{habit.description}</p>
          )}
        </div>

        {/* Streak */}
        {habit.currentStreak > 0 && (
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e0e0e0] text-sm"
            style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
          >
            <span>🔥</span>
            <span className="font-medium text-[#4a4a4a]">{habit.currentStreak}</span>
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="flex items-center gap-1.5 mt-3 ml-11">
        {displayWeekly.map((day, idx) => (
          <div
            key={idx}
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: day.completed ? habit.color : '#e0e0e0',
              boxShadow: day.completed
                ? 'inset 1px 1px 2px rgba(0,0,0,0.15)'
                : 'inset -1px -1px 2px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(190,190,190,0.8)',
              opacity: day.completed ? 1 : 0.5,
            }}
            title={day.date}
          >
            {day.completed && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function generateDefaultWeekly(todayCompleted: boolean): { date: string; completed: boolean }[] {
  const today = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    result.push({
      date: format(date, 'yyyy-MM-dd'),
      completed: i === 0 ? todayCompleted : false, // Only today reflects actual status
    });
  }
  return result;
}
