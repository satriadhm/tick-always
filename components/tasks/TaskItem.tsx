'use client';

import { useState } from 'react';
import { Priority } from '@/types';
import { format, isToday, isPast, parseISO } from 'date-fns';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string | null;
    priority: Priority;
    tags: string[];
    completed: boolean;
    isRecurring: boolean;
  };
  isSelected: boolean;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const priorityColors = {
  none: '',
  low: 'bg-blue-500',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
};

export default function TaskItem({
  task,
  isSelected,
  onToggleComplete,
  onDelete,
  onClick,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDueDateBadge = () => {
    if (!task.dueDate) return null;

    try {
      const date = parseISO(task.dueDate);
      const dateStr = format(date, 'MMM d');

      if (isToday(date)) {
        return (
          <span className="text-xs text-gray-500">
            Today
          </span>
        );
      }

      if (isPast(date) && !task.completed) {
        return (
          <span className="text-xs text-red-600">
            Overdue
          </span>
        );
      }

      return (
        <span className="text-xs text-gray-500">
          {dateStr}
        </span>
      );
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 py-2.5 px-4 rounded-lg border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-gray-50 border-gray-300'
          : task.completed
          ? 'bg-white border-gray-200 opacity-60 hover:border-gray-300'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      style={{ minHeight: '44px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(task.id)}
    >
      {/* Checkbox - TickTick style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id, !task.completed);
        }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          task.completed
            ? 'bg-[#3E7BFA] border-[#3E7BFA]'
            : 'border-gray-300 hover:border-[#3E7BFA] bg-white'
        }`}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h3
            className={`text-[15px] font-medium text-gray-800 line-clamp-1 ${
              task.completed ? 'line-through text-gray-500' : ''
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Metadata Row */}
        {(task.dueDate || task.priority !== 'none' || task.tags.length > 0 || task.isRecurring) && (
          <div className="flex items-center gap-2 mt-0.5">
            {getDueDateBadge()}
            {task.priority !== 'none' && (
              <div
                className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
                title={`Priority: ${task.priority}`}
              />
            )}
            {task.isRecurring && (
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Recurring task">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions - Hidden until hover */}
      {isHovered && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Star functionality (future)
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            title="Star"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Reminder functionality (future)
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            title="Reminder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
