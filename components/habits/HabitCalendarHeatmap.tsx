'use client';

import { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay } from 'date-fns';

interface HabitCalendarHeatmapProps {
  habitId: string;
  color: string;
  completionsByDate: Record<string, boolean>;
}

export default function HabitCalendarHeatmap({
  color,
  completionsByDate,
}: HabitCalendarHeatmapProps) {
  const [viewDate] = useState(new Date());
  
  // Get current month bounds
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  
  // Get all days in current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = getDay(monthStart);
  
  // Pad with empty days for alignment
  const paddedDays: (Date | null)[] = Array(startDayOfWeek).fill(null).concat(daysInMonth);
  
  // Fill to complete last week
  while (paddedDays.length % 7 !== 0) {
    paddedDays.push(null);
  }
  
  // Split into weeks
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const isCompleted = (date: Date | null): boolean => {
    if (!date) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return !!completionsByDate[dateStr];
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  return (
    <div>
      <p className="text-sm font-medium text-[#4a4a4a] mb-3">{format(viewDate, 'MMMM yyyy')}</p>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-center text-xs text-[#8a8a8a]">{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIdx) => {
              if (!day) {
                return <div key={dayIdx} className="w-8 h-8" />;
              }
              
              const completed = isCompleted(day);
              const today = isToday(day);
              
              return (
                <div
                  key={dayIdx}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                    today ? 'ring-2 ring-offset-1 ring-[color:var(--ring-color)]' : ''
                  }`}
                  style={{
                    backgroundColor: completed ? color : '#e0e0e0',
                    color: completed ? 'white' : '#6b6b6b',
                    boxShadow: completed
                      ? 'inset 1px 1px 2px rgba(0,0,0,0.15)'
                      : 'inset -1px -1px 2px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(190,190,190,0.6)',
                    '--ring-color': today ? color : 'transparent',
                  } as React.CSSProperties}
                  title={format(day, 'EEEE, MMMM d')}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-[#8a8a8a]">
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: '#e0e0e0',
              boxShadow: 'inset -1px -1px 2px rgba(255,255,255,0.6), inset 1px 1px 2px rgba(190,190,190,0.6)',
            }}
          />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: color, boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.15)' }}
          />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

// Simple streak calendar showing last N days
interface StreakCalendarProps {
  completionsByDate: Record<string, boolean>;
  color: string;
  days?: number;
}

export function StreakCalendar({ completionsByDate, color, days = 30 }: StreakCalendarProps) {
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => subDays(today, days - 1 - i));

  return (
    <div className="flex flex-wrap gap-1">
      {dates.map((date, idx) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completed = !!completionsByDate[dateStr];
        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

        return (
          <div
            key={idx}
            className={`w-3 h-3 rounded-sm transition-all duration-200 ${isToday ? 'ring-1 ring-offset-1 ring-[color:var(--ring-color)]' : ''}`}
            style={{
              backgroundColor: completed ? color : '#e0e0e0',
              boxShadow: completed
                ? 'inset 0.5px 0.5px 1px rgba(0,0,0,0.15)'
                : 'inset -0.5px -0.5px 1px rgba(255,255,255,0.6), inset 0.5px 0.5px 1px rgba(190,190,190,0.6)',
              opacity: completed ? 1 : 0.5,
              '--ring-color': isToday ? color : 'transparent',
            } as React.CSSProperties}
            title={format(date, 'MMM d')}
          />
        );
      })}
    </div>
  );
}
