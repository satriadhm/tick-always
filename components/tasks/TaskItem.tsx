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
  low: 'bg-[#6bb38c]',
  medium: 'bg-[#ceb06b]',
  high: 'bg-[#ce6b6b]',
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
          <span className="text-xs text-[#6b6b6b] font-medium">
            Today
          </span>
        );
      }

      if (isPast(date) && !task.completed) {
        return (
          <span className="text-xs text-[#ce6b6b] font-medium">
            Overdue
          </span>
        );
      }

      return (
        <span className="text-xs text-[#8a8a8a]">
          {dateStr}
        </span>
      );
    } catch {
      return null;
    }
  };

  // Determine shadow based on state
  const getShadowStyle = () => {
    if (isSelected) {
      return 'inset -3px -3px 6px rgba(255,255,255,0.9), inset 3px 3px 6px rgba(190,190,190,0.9)';
    }
    if (task.completed) {
      return '-2px -2px 4px rgba(255,255,255,0.6), 2px 2px 4px rgba(190,190,190,0.6)';
    }
    return '-4px -4px 8px rgba(255,255,255,0.9), 4px 4px 8px rgba(190,190,190,0.9)';
  };

  const getHoverShadow = () => {
    if (isSelected) {
      return 'inset -3px -3px 6px rgba(255,255,255,0.9), inset 3px 3px 6px rgba(190,190,190,0.9)';
    }
    if (task.completed) {
      return '-3px -3px 6px rgba(255,255,255,0.7), 3px 3px 6px rgba(190,190,190,0.7)';
    }
    return '-5px -5px 10px rgba(255,255,255,0.95), 5px 5px 10px rgba(190,190,190,0.95)';
  };

  return (
    <div
      className={`
        group flex items-center gap-4 py-3.5 px-5 rounded-2xl 
        transition-all duration-200 cursor-pointer
        bg-[#e0e0e0]
        ${task.completed ? 'opacity-60' : ''}
      `}
      style={{ 
        minHeight: '48px',
        boxShadow: isHovered ? getHoverShadow() : getShadowStyle(),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(task.id)}
    >
      {/* Checkbox - Neumorphic style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id, !task.completed);
        }}
        className={`
          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
          transition-all duration-200
          ${task.completed
            ? `
              bg-[#6b8cce]
              shadow-[
                inset_1px_1px_2px_rgba(0,0,0,0.2),
                inset_-1px_-1px_2px_rgba(255,255,255,0.3)
              ]
            `
            : `
              bg-[#e0e0e0]
              shadow-[
                inset_-2px_-2px_4px_rgba(255,255,255,0.9),
                inset_2px_2px_4px_rgba(190,190,190,0.9)
              ]
              hover:shadow-[
                inset_-2px_-2px_4px_rgba(255,255,255,0.9),
                inset_2px_2px_4px_rgba(190,190,190,0.9),
                0_0_0_2px_rgba(107,140,206,0.4)
              ]
            `
          }
        `}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <svg
            className="w-3.5 h-3.5 text-white"
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
            className={`text-[15px] font-medium text-[#4a4a4a] line-clamp-1 ${
              task.completed ? 'line-through text-[#8a8a8a]' : ''
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Metadata Row */}
        {(task.dueDate || task.priority !== 'none' || task.tags.length > 0 || task.isRecurring) && (
          <div className="flex items-center gap-2 mt-1">
            {getDueDateBadge()}
            {task.priority !== 'none' && (
              <div
                className={`w-2.5 h-2.5 rounded-full ${priorityColors[task.priority]}`}
                title={`Priority: ${task.priority}`}
              />
            )}
            {task.isRecurring && (
              <svg className="w-3.5 h-3.5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Recurring task</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="
                      text-xs px-2 py-0.5 rounded-lg text-[#6b6b6b]
                      bg-[#e0e0e0]
                      shadow-[
                        -1px_-1px_2px_rgba(255,255,255,0.8),
                        1px_1px_2px_rgba(190,190,190,0.8)
                      ]
                    "
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-[#8a8a8a]">+{task.tags.length - 2}</span>
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
            className="
              p-2 rounded-xl text-[#8a8a8a] transition-all duration-200
              hover:text-[#ceb06b]
              hover:bg-[#e0e0e0]
              hover:shadow-[
                -2px_-2px_4px_rgba(255,255,255,0.8),
                2px_2px_4px_rgba(190,190,190,0.8)
              ]
            "
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
            className="
              p-2 rounded-xl text-[#8a8a8a] transition-all duration-200
              hover:text-[#6b8cce]
              hover:bg-[#e0e0e0]
              hover:shadow-[
                -2px_-2px_4px_rgba(255,255,255,0.8),
                2px_2px_4px_rgba(190,190,190,0.8)
              ]
            "
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
            className="
              p-2 rounded-xl text-[#8a8a8a] transition-all duration-200
              hover:text-[#ce6b6b]
              hover:bg-[#e0e0e0]
              hover:shadow-[
                -2px_-2px_4px_rgba(255,255,255,0.8),
                2px_2px_4px_rgba(190,190,190,0.8)
              ]
            "
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
