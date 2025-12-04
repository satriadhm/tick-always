'use client';

import { useState, useEffect, useRef } from 'react';
import { Priority } from '@/types';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export default function TaskDetailPanel({
  taskId,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [tags, setTags] = useState<string[]>([]);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const fetchTask = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        const taskData = data.data.task;
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setDueDate(taskData.dueDate ? taskData.dueDate.split('T')[0] : '');
        setPriority(taskData.priority);
        setTags(taskData.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!taskId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description: description || undefined,
          dueDate: dueDate || undefined,
          priority,
          tags,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsEditingTitle(false);
        onUpdate();
        fetchTask();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!taskId) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !task?.completed }),
      });

      const data = await response.json();
      if (data.success) {
        fetchTask();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(taskId);
      onClose();
    }
  };

  if (!taskId) return null;

  if (isLoading) {
    return (
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3E7BFA] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Completion Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task?.completed || false}
            onChange={handleToggleComplete}
            className="w-5 h-5 rounded border-gray-300 text-[#3E7BFA] focus:ring-[#3E7BFA]"
          />
          <span className="text-sm text-gray-600">
            {task?.completed ? 'Completed' : 'Mark as complete'}
          </span>
        </div>

        {/* Task Title - Large Editable Field */}
        <div>
          {isEditingTitle ? (
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                handleSave();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditingTitle(false);
                  handleSave();
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setTitle(task?.title || '');
                }
              }}
              className="w-full text-xl font-semibold leading-tight border-b-2 border-gray-300 focus:border-[#3E7BFA] pb-1 outline-none resize-none"
              rows={1}
              style={{ minHeight: '32px' }}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-xl font-semibold leading-tight text-gray-900 cursor-text hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              {title || 'Untitled Task'}
            </h2>
          )}
        </div>

        {/* Description Field */}
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Add description…"
            rows={6}
            className="w-full text-sm text-gray-700 mt-3 mb-2 min-h-[120px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3E7BFA] focus:border-transparent resize-none"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Property Rows */}
        <div className="space-y-1">
          {/* Due Date */}
          <PropertyRow
            icon="📅"
            label="Due Date"
            value={dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : 'No date'}
            onClick={() => {
              // Open date picker popover (future)
            }}
            onValueChange={(value) => {
              setDueDate(value);
              handleSave();
            }}
            type="date"
          />

          {/* Repeat */}
          <PropertyRow
            icon="🔄"
            label="Repeat"
            value={task?.isRecurring ? 'Repeats' : 'Does not repeat'}
            onClick={() => {
              // Open repeat selector (future)
            }}
          />

          {/* Reminder */}
          <PropertyRow
            icon="⏰"
            label="Reminder"
            value="None"
            onClick={() => {
              // Open reminder selector (future)
            }}
          />

          {/* Tags */}
          <PropertyRow
            icon="🏷️"
            label="Tags"
            value={tags.length > 0 ? tags.join(', ') : 'No tags'}
            onClick={() => {
              // Open tag selector (future)
            }}
          />

          {/* Priority */}
          <PropertyRow
            icon="⚡"
            label="Priority"
            value={
              priority === 'none'
                ? 'None'
                : priority.charAt(0).toUpperCase() + priority.slice(1)
            }
            onClick={() => {
              // Open priority selector (future)
            }}
            onValueChange={(value) => {
              setPriority(value as Priority);
              handleSave();
            }}
            type="priority"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Checklist/Subtasks (placeholder) */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Checklist</h3>
          <p className="text-xs text-gray-500">Subtasks coming soon...</p>
        </div>

        {/* Activity Log */}
        {task && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Created: {format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}
            </p>
            {task.updatedAt !== task.createdAt && (
              <p className="text-xs text-gray-500 mt-1">
                Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </div>
        )}

        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

// Property Row Component
interface PropertyRowProps {
  icon: string;
  label: string;
  value: string;
  onClick: () => void;
  onValueChange?: (value: string) => void;
  type?: 'date' | 'priority' | 'default';
}

function PropertyRow({ icon, label, value, onClick, onValueChange, type }: PropertyRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (onValueChange && editValue !== value) {
      onValueChange(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing && type === 'date') {
    return (
      <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer">
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <input
          type="date"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
          autoFocus
        />
      </div>
    );
  }

  if (isEditing && type === 'priority') {
    return (
      <div className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer">
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <select
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            handleSave();
          }}
          className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1"
          autoFocus
        >
          <option value="none">None</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => {
        if (onValueChange) {
          setIsEditing(true);
        } else {
          onClick();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className={`text-sm ${value === 'No date' || value === 'No tags' || value === 'None' ? 'text-gray-500' : 'text-[#3E7BFA]'}`}>
        {value}
      </span>
    </div>
  );
}
