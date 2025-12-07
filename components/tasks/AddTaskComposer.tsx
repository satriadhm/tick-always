'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Priority } from '@/types';

interface AddTaskComposerProps {
  onAddTask: (data: { title: string; description?: string; dueDate?: string; priority?: Priority; tags?: string[] }) => Promise<void>;
}

export default function AddTaskComposer({ onAddTask }: AddTaskComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [tags, setTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut: 'N' to focus
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          inputRef.current?.focus();
          setIsExpanded(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress as (e: KeyboardEvent) => void);
    return () => window.removeEventListener('keydown', handleKeyPress as (e: KeyboardEvent) => void);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    await onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      tags,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('none');
    setTags([]);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('none');
    setTags([]);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isExpanded) {
    return (
      <div
        className="h-11 border border-gray-200 rounded-xl px-3 flex items-center cursor-text"
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className="text-gray-400 mr-2">+</span>
        <span className="text-gray-500 text-sm">Add Task</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm rounded-xl border border-gray-200 p-4"
    >
      {/* Multi-line textarea */}
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task title..."
        className="w-full min-h-[70px] border-none outline-none resize-none text-[15px] font-medium text-gray-800 placeholder-gray-400"
        autoFocus
      />

      {/* Button Strip */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {/* Due Date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            title="Due Date"
          />

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            title="Priority"
          >
            <option value="none">Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Tag (simplified for now) */}
          <button
            type="button"
            className="text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600"
            title="Add Tag"
          >
            Tag
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="text-sm bg-[#3E7BFA] text-white px-4 py-1.5 rounded-md hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

