'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface AddTaskBarProps {
  onAddTask: (title: string) => Promise<void>;
  placeholder?: string;
}

export default function AddTaskBar({ onAddTask, placeholder = 'Add a task…' }: AddTaskBarProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: 'N' to focus
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress as (e: KeyboardEvent) => void);
    return () => window.removeEventListener('keydown', handleKeyPress as (e: KeyboardEvent) => void);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onAddTask(title.trim());
      setTitle('');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter for new line (handled by textarea if needed)
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E7BFA] focus:border-transparent text-sm"
        />
        {isLoading && (
          <div className="w-5 h-5 border-2 border-[#3E7BFA] border-t-transparent rounded-full animate-spin"></div>
        )}
      </form>
      <p className="text-xs text-gray-500 mt-1 px-4">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to add,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">N</kbd> to focus
      </p>
    </div>
  );
}

