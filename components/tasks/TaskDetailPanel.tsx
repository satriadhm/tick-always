'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Priority } from '@/types';
import { format } from 'date-fns';

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
  interface TaskData {
    id: string;
    title: string;
    description?: string;
    dueDate?: string | null;
    priority: Priority;
    tags: string[];
    completed: boolean;
    isRecurring: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  const [task, setTask] = useState<TaskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<TaskData[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchTask = useCallback(async () => {
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
        setDueDate(taskData.dueDate ? format(new Date(taskData.dueDate), 'yyyy-MM-dd') : '');
        setPriority(taskData.priority);
        setTags(taskData.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch task:', error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSave = async () => {
    if (!taskId) return;
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

  const fetchSubtasks = useCallback(async () => {
    if (!taskId) return;
    try {
      const response = await fetch(`/api/tasks?parentTaskId=${taskId}&limit=100&sortBy=createdAt&sortOrder=asc`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setSubtasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch subtasks:', error);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    }
  }, [taskId, fetchSubtasks]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newSubtaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubtaskTitle,
          parentTaskId: taskId,
        }),
      });

      if (response.ok) {
        setNewSubtaskTitle('');
        fetchSubtasks();
      }
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${subtaskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      fetchSubtasks();
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Delete this subtask?')) return;
    try {
      await fetch(`/api/tasks/${subtaskId}`, { method: 'DELETE' });
      fetchSubtasks();
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  if (!taskId) return null;

  if (isLoading) {
    return (
      <div 
        className="fixed right-0 top-0 h-full w-[480px] bg-[#e0e0e0] z-50 flex items-center justify-center"
        style={{ boxShadow: '-8px 0 16px rgba(190,190,190,0.5)' }}
      >
        <div className="text-center">
          <div 
            className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-[#e0e0e0]"
            style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.9), 3px 3px 6px rgba(190,190,190,0.9)' }}
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#6b8cce] border-t-transparent"></div>
          </div>
          <p className="mt-4 text-sm text-[#6b6b6b]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed right-0 top-0 h-full w-[480px] bg-[#e0e0e0] z-50 overflow-y-auto animate-in slide-in-from-right duration-200"
      style={{ boxShadow: '-8px 0 16px rgba(190,190,190,0.5)' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#e0e0e0] px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-[#4a4a4a]">Task Details</h2>
        <button
          onClick={onClose}
          className="p-2 text-[#6b6b6b] rounded-xl transition-all duration-200 bg-[#e0e0e0] hover:text-[#4a4a4a]"
          style={{ boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 h-0.5 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />

      <div className="p-6 space-y-6">
        {/* Completion Checkbox */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center
              transition-all duration-200
              ${task?.completed
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
                `
              }
            `}
          >
            {task?.completed && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span className="text-sm text-[#6b6b6b]">
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
              className="
                w-full text-xl font-semibold leading-tight pb-2 outline-none resize-none
                bg-transparent text-[#4a4a4a]
                border-b-2 border-[#6b8cce]
              "
              rows={1}
              style={{ minHeight: '32px' }}
            />
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="
                text-xl font-semibold leading-tight text-[#4a4a4a] cursor-text 
                -mx-2 px-2 py-2 rounded-xl
                hover:bg-[#e0e0e0]
                hover:shadow-[
                  inset_-2px_-2px_4px_rgba(255,255,255,0.8),
                  inset_2px_2px_4px_rgba(190,190,190,0.8)
                ]
                transition-all duration-200
              "
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
            className="
              w-full text-sm text-[#4a4a4a] mt-3 mb-2 min-h-[120px] 
              bg-[#e0e0e0] rounded-xl px-4 py-3 resize-none
              shadow-[
                inset_-3px_-3px_6px_rgba(255,255,255,0.9),
                inset_3px_3px_6px_rgba(190,190,190,0.9)
              ]
              focus:outline-none
              focus:shadow-[
                inset_-3px_-3px_6px_rgba(255,255,255,0.9),
                inset_3px_3px_6px_rgba(190,190,190,0.9),
                0_0_0_2px_rgba(107,140,206,0.5)
              ]
              placeholder:text-[#8a8a8a]
              transition-all duration-200
            "
          />
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />

        {/* Property Rows */}
        <div className="space-y-2">
          {/* Due Date */}
          <PropertyRow
            icon="📅"
            label="Due Date"
            value={dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : 'No date'}
            onClick={() => {}}
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
            onClick={() => {}}
          />

          {/* Reminder */}
          <PropertyRow
            icon="⏰"
            label="Reminder"
            value="None"
            onClick={() => {}}
          />

          {/* Tags */}
          <PropertyRow
            icon="🏷️"
            label="Tags"
            value={tags.length > 0 ? tags.join(', ') : 'No tags'}
            onClick={() => {}}
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
            onClick={() => {}}
            onValueChange={(value) => {
              setPriority(value as Priority);
              handleSave();
            }}
            type="priority"
          />
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />

        {/* Subtasks (Checklist) */}
        <div>
          <h3 className="text-sm font-medium text-[#4a4a4a] mb-3">Checklist</h3>
          
          <div className="space-y-2 mb-3">
            {subtasks.map((subtask) => (
              <div 
                key={subtask.id} 
                className="flex items-center gap-3 p-2 rounded-lg group hover:bg-[#dcdcdc] transition-colors"
              >
                <button
                  onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${subtask.completed
                      ? 'bg-[#6b8cce] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.3)]'
                      : 'bg-[#e0e0e0] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(190,190,190,0.9)]'
                    }
                  `}
                >
                  {subtask.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm flex-1 ${subtask.completed ? 'text-[#8a8a8a] line-through' : 'text-[#4a4a4a]'}`}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="p-1 text-[#ce6b6b] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add an item"
              className="
                flex-1 bg-[#e0e0e0] text-sm text-[#4a4a4a] px-3 py-2 rounded-lg outline-none
                shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(190,190,190,0.8)]
                placeholder:text-[#8a8a8a]
              "
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim()}
              className="
                px-3 py-2 bg-[#e0e0e0] text-[#6b6b6b] rounded-lg text-sm font-medium
                shadow-[-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(190,190,190,0.8)]
                active:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(190,190,190,0.8)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            >
              Add
            </button>
          </form>
        </div>

        {/* Activity Log */}
        {task && task.createdAt && (
          <div className="pt-4">
            <div className="h-0.5 mb-4 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />
            <p className="text-xs text-[#8a8a8a]">
              Created: {format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}
            </p>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <p className="text-xs text-[#8a8a8a] mt-1">
                Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </div>
        )}

        {/* Delete Button */}
        <div className="pt-4">
          <div className="h-0.5 mb-4 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent rounded-full" />
          <button
            onClick={handleDelete}
            className="w-full text-[#ce6b6b] p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-[#e0e0e0]"
            style={{ boxShadow: '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    if (onValueChange && editValue !== value) {
      onValueChange(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing && type === 'date') {
    return (
      <div 
        className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer bg-[#e0e0e0]"
        style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
      >
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span className="text-sm text-[#4a4a4a]">{label}</span>
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
          className="text-sm text-[#4a4a4a] bg-[#e0e0e0] rounded-lg px-2 py-1 border-none outline-none"
          style={{ boxShadow: '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)' }}
          autoFocus
        />
      </div>
    );
  }

  if (isEditing && type === 'priority') {
    return (
      <div 
        className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer bg-[#e0e0e0]"
        style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
      >
        <div className="flex items-center gap-3">
          <span>{icon}</span>
          <span className="text-sm text-[#4a4a4a]">{label}</span>
        </div>
        <select
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            if (onValueChange) {
              onValueChange(e.target.value);
            }
            setIsEditing(false);
          }}
          className="text-sm text-[#4a4a4a] bg-[#e0e0e0] rounded-lg px-2 py-1 border-none outline-none"
          style={{ boxShadow: '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)' }}
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
      className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 bg-[#e0e0e0]"
      style={{ 
        boxShadow: isHovered 
          ? '-3px -3px 6px rgba(255,255,255,0.9), 3px 3px 6px rgba(190,190,190,0.9)' 
          : '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)' 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <span className="text-sm text-[#4a4a4a]">{label}</span>
      </div>
      <span className={`text-sm ${value === 'No date' || value === 'No tags' || value === 'None' ? 'text-[#8a8a8a]' : 'text-[#6b8cce]'}`}>
        {value}
      </span>
    </div>
  );
}
