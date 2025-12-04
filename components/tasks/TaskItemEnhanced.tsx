'use client';

import { useState } from 'react';
import { Priority } from '@/types';
import { format, isToday, isPast, parseISO } from 'date-fns';

interface TaskItemEnhancedProps {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: Priority;
  tags: string[];
  completed: boolean;
  isRecurring: boolean;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const priorityColors = {
  none: '',
  low: 'bg-[#4CAF50]',
  medium: 'bg-[#FFA94D]',
  high: 'bg-[#FF5F5F]',
};

export default function TaskItemEnhanced({
  id,
  title,
  description,
  dueDate,
  priority,
  tags,
  completed,
  isRecurring,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}: TaskItemEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getDueDateBadge = () => {
    if (!dueDate) return null;

    try {
      const date = parseISO(dueDate);
      const dateStr = format(date, 'MMM d');

      if (isToday(date)) {
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#3E7BFA] text-white">
            Today
          </span>
        );
      }

      if (isPast(date) && !completed) {
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#FF5F5F] text-white">
            Overdue
          </span>
        );
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
            Tomorrow
          </span>
        );
      }

      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
          {dateStr}
        </span>
      );
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`group bg-white border-b border-gray-100 hover:bg-[#F7F7F7] transition-colors duration-150 ${
        completed ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(id, !completed);
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
            completed
              ? 'bg-[#3E7BFA] border-[#3E7BFA]'
              : 'border-gray-300 hover:border-[#3E7BFA]'
          }`}
          aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {completed && (
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
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onClick(id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm font-medium text-gray-900 ${
                  completed ? 'line-through' : ''
                }`}
              >
                {title}
              </h3>
              {description && (
                <p
                  className={`mt-1 text-xs text-gray-600 line-clamp-2 ${
                    completed ? 'line-through' : ''
                  }`}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Badges and Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Badges */}
              <div className="flex items-center gap-1.5">
                {getDueDateBadge()}
                {priority !== 'none' && (
                  <div
                    className={`w-2 h-2 rounded-full ${priorityColors[priority]}`}
                    title={`Priority: ${priority}`}
                  />
                )}
                {isRecurring && (
                  <span className="text-xs text-gray-500" title="Recurring task">
                    🔄
                  </span>
                )}
                {tags.length > 0 && (
                  <div className="flex gap-1">
                    {tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              {isHovered && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this task?')) {
                        onDelete(id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

