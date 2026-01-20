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
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          inputRef.current?.focus();
          setIsExpanded(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        className="h-12 px-4 flex items-center cursor-text transition-all duration-200 rounded-xl bg-[#e0e0e0]"
        style={{
          boxShadow: '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)',
        }}
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => textareaRef.current?.focus(), 0);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '-4px -4px 8px rgba(255,255,255,0.9), 4px 4px 8px rgba(190,190,190,0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '-3px -3px 6px rgba(255,255,255,0.8), 3px 3px 6px rgba(190,190,190,0.8)';
        }}
      >
        <span className="text-[#8a8a8a] mr-2 text-lg">+</span>
        <span className="text-[#6b6b6b] text-sm">Add Task</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 bg-[#e0e0e0]"
      style={{
        boxShadow: '-6px -6px 12px rgba(255,255,255,0.9), 6px 6px 12px rgba(190,190,190,0.9)',
      }}
    >
      {/* Multi-line textarea */}
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Task title..."
        className="w-full min-h-[70px] resize-none text-[15px] font-medium rounded-xl p-4 bg-[#e0e0e0] text-[#4a4a4a] placeholder-[#8a8a8a] outline-none"
        style={{
          boxShadow: 'inset -3px -3px 6px rgba(190,190,190,0.9), inset 3px 3px 6px rgba(255,255,255,0.9)',
        }}
        autoFocus
      />

      {/* Button Strip */}
      <div className="flex items-center justify-between mt-4 pt-4">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-xs px-3 py-2 cursor-pointer rounded-lg bg-[#e0e0e0] text-[#4a4a4a] outline-none"
            style={{
              boxShadow: 'inset -2px -2px 4px rgba(190,190,190,0.8), inset 2px 2px 4px rgba(255,255,255,0.8)',
            }}
            title="Due Date"
          />

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs px-3 py-2 cursor-pointer rounded-lg bg-[#e0e0e0] text-[#4a4a4a] outline-none"
            style={{
              boxShadow: 'inset -2px -2px 4px rgba(190,190,190,0.8), inset 2px 2px 4px rgba(255,255,255,0.8)',
            }}
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
            className="text-xs px-3 py-2 rounded-lg bg-[#e0e0e0] text-[#6b6b6b] transition-all duration-200"
            style={{
              boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '-1px -1px 2px rgba(255,255,255,0.6), 1px 1px 2px rgba(190,190,190,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
            }}
            title="Add Tag"
          >
            Tag
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm px-4 py-2 rounded-lg bg-[#e0e0e0] text-[#6b6b6b] transition-all duration-200 hover:text-[#4a4a4a]"
            style={{
              boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '-1px -1px 2px rgba(255,255,255,0.6), 1px 1px 2px rgba(190,190,190,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="text-sm px-5 py-2 rounded-lg bg-[#6b8cce] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.boxShadow = '-1px -1px 2px rgba(255,255,255,0.6), 1px 1px 2px rgba(190,190,190,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
            }}
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

