'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  hideCompleted: boolean;
  onHideCompletedChange: (hide: boolean) => void;
}

export default function CalendarToolbar({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onViewModeChange,
  hideCompleted,
  onHideCompletedChange,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-4">
      <div className="flex items-center gap-4">
        <ToolbarButton onClick={onToday}>Today</ToolbarButton>
        <div className="flex items-center gap-2">
          <NavButton onClick={onPrevious} aria-label="Previous">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </NavButton>
          <NavButton onClick={onNext} aria-label="Next">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </NavButton>
        </div>
        <h2 className="text-xl font-semibold text-[#4a4a4a] ml-4">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />

        <label className="flex items-center gap-2 text-sm text-[#6b6b6b] cursor-pointer">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => onHideCompletedChange(e.target.checked)}
            className="neu-checkbox w-5 h-5"
          />
          <span>Hide completed</span>
        </label>
      </div>
    </div>
  );
}

// Toolbar button with neumorphic styling
interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

function ToolbarButton({ children, onClick }: ToolbarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-[#6b6b6b] bg-[#e0e0e0] rounded-xl transition-all duration-200"
      style={{
        boxShadow: isHovered
          ? '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)'
          : '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
        color: isHovered ? '#4a4a4a' : '#6b6b6b',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
}

// Navigation button
interface NavButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  'aria-label': string;
}

function NavButton({ children, onClick, 'aria-label': ariaLabel }: NavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl text-[#6b6b6b] bg-[#e0e0e0] transition-all duration-200"
      style={{
        boxShadow: isHovered
          ? '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)'
          : '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
        color: isHovered ? '#4a4a4a' : '#6b6b6b',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

// View mode toggle with neumorphic styling
interface ViewModeToggleProps {
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div 
      className="flex items-center gap-1 bg-[#e0e0e0] rounded-xl p-1"
      style={{ boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)' }}
    >
      {(['month', 'week', 'day'] as const).map((mode) => (
        <ViewModeButton
          key={mode}
          mode={mode}
          isActive={viewMode === mode}
          onClick={() => onViewModeChange(mode)}
        />
      ))}
    </div>
  );
}

interface ViewModeButtonProps {
  mode: 'month' | 'week' | 'day';
  isActive: boolean;
  onClick: () => void;
}

function ViewModeButton({ mode, isActive, onClick }: ViewModeButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getShadow = () => {
    if (isActive) {
      return '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)';
    }
    if (isHovered) {
      return '-1px -1px 2px rgba(255,255,255,0.6), 1px 1px 2px rgba(190,190,190,0.6)';
    }
    return 'none';
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive ? 'text-[#6b8cce] bg-[#e0e0e0]' : 'text-[#6b6b6b]'
      }`}
      style={{ boxShadow: getShadow() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </button>
  );
}
