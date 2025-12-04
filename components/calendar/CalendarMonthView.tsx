'use client';

import { useState } from 'react';
import { format, isToday, isSameMonth, startOfWeek, startOfMonth, endOfMonth, endOfWeek, addDays, parseISO } from 'date-fns';

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
  none: 'bg-gray-400',
  low: 'bg-blue-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center text-sm font-semibold text-gray-700 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-[2px] bg-gray-200 p-[2px]">
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const visibleTasks = dayTasks.slice(0, 3);
          const remainingCount = Math.max(0, dayTasks.length - 3);

          return (
            <div
              key={index}
              onClick={() => onDayClick(day)}
              onDoubleClick={() => onDayDoubleClick(day)}
              className={`min-h-[100px] bg-white p-2 cursor-pointer transition-colors ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${isSelected ? 'bg-blue-50 ring-2 ring-[#3E7BFA]' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isCurrentDay
                      ? 'w-7 h-7 rounded-full bg-[#3E7BFA] text-white flex items-center justify-center'
                      : isSelected
                      ? 'text-[#3E7BFA]'
                      : 'text-gray-900'
                  }`}
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
                    <span className="truncate text-gray-700">{task.title}</span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-xs text-gray-500 font-medium">+{remainingCount} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

