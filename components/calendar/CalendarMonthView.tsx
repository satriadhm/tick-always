'use client';

import { useState } from 'react';
import { format, isToday, isSameMonth, startOfWeek, startOfMonth, endOfMonth, endOfWeek, addDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  priority: 'none' | 'low' | 'medium' | 'high';
  completed: boolean;
}

interface CalendarDay {
  date: string;
  tasks: Task[];
}

interface CalendarMonthViewProps {
  currentDate: Date;
  days: CalendarDay[];
  onDayClick: (date: Date) => void;
  onDayDoubleClick: (date: Date) => void;
  selectedDate?: Date | null;
}

const priorityColors = {
  none: 'bg-[#8a8a8a]',
  low: 'bg-[#6bb38c]',
  medium: 'bg-[#ceb06b]',
  high: 'bg-[#ce6b6b]',
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarMonthView({
  currentDate,
  days,
  onDayClick,
  onDayDoubleClick,
  selectedDate,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const tasksByDate: { [key: string]: Task[] } = {};
  days.forEach((day) => {
    tasksByDate[day.date] = day.tasks;
  });

  const calendarDays: Date[] = [];
  let currentDay = new Date(calendarStart);
  while (currentDay <= calendarEnd) {
    calendarDays.push(new Date(currentDay));
    currentDay = addDays(currentDay, 1);
  }

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateStr] || [];
  };

  return (
    <div 
      className="bg-[#e0e0e0] rounded-2xl overflow-hidden"
      style={{ boxShadow: '-4px -4px 8px rgba(255,255,255,0.9), 4px 4px 8px rgba(190,190,190,0.9)' }}
    >
      {/* Week day headers */}
      <div 
        className="grid grid-cols-7"
        style={{ boxShadow: 'inset 0 -1px 0 rgba(190,190,190,0.5)' }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center text-sm font-semibold text-[#6b6b6b]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-[1px] p-2">
        {calendarDays.map((day, index) => (
          <CalendarDayCell
            key={index}
            day={day}
            tasks={getTasksForDate(day)}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isCurrentDay={isToday(day)}
            isSelected={selectedDate ? format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : false}
            onClick={() => onDayClick(day)}
            onDoubleClick={() => onDayDoubleClick(day)}
          />
        ))}
      </div>
    </div>
  );
}

// Calendar day cell component with neumorphic styling
interface CalendarDayCellProps {
  day: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function CalendarDayCell({
  day,
  tasks,
  isCurrentMonth,
  isCurrentDay,
  isSelected,
  onClick,
  onDoubleClick,
}: CalendarDayCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const visibleTasks = tasks.slice(0, 3);
  const remainingCount = Math.max(0, tasks.length - 3);

  const getShadow = () => {
    if (isSelected) {
      return 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)';
    }
    if (isHovered) {
      return '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
    }
    return '-1px -1px 2px rgba(255,255,255,0.6), 1px 1px 2px rgba(190,190,190,0.6)';
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`min-h-[100px] rounded-xl p-2 cursor-pointer transition-all duration-200 bg-[#e0e0e0] ${
        !isCurrentMonth ? 'opacity-40' : ''
      }`}
      style={{ boxShadow: getShadow() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-medium ${
            isCurrentDay
              ? 'w-7 h-7 rounded-full bg-[#6b8cce] text-white flex items-center justify-center'
              : isSelected
              ? 'text-[#6b8cce]'
              : 'text-[#4a4a4a]'
          }`}
          style={
            isCurrentDay
              ? { boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.3)' }
              : undefined
          }
        >
          {format(day, 'd')}
        </span>
      </div>

      <div className="space-y-1">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-1.5 text-xs truncate ${
              task.completed ? 'line-through opacity-60' : ''
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}
            />
            <span className="truncate text-[#4a4a4a]">{task.title}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-[#8a8a8a] font-medium">+{remainingCount} more</div>
        )}
      </div>
    </div>
  );
}
