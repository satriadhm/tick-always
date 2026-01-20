'use client';

import { useState } from 'react';

interface AddHabitModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    frequency?: { type: string; daysOfWeek: string[] };
    color?: string;
    icon?: string;
  }) => Promise<void>;
}

const COLORS = [
  '#6b8cce', // Blue (default)
  '#6bb38c', // Green
  '#ce6b6b', // Red
  '#ceb06b', // Yellow
  '#9b6bce', // Purple
  '#ce6b9b', // Pink
  '#6bcece', // Cyan
  '#ce9b6b', // Orange
];

const ICONS = ['🏃', '💪', '📚', '🧘', '💧', '🍎', '😴', '🎯', '✍️', '🎵', '🌱', '💊'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AddHabitModal({ onClose, onSave }: AddHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly'>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency: {
          type: frequencyType,
          daysOfWeek: frequencyType === 'weekly' ? selectedDays : [],
        },
        color,
        icon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
      setIsLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 bg-[#e0e0e0] rounded-2xl p-6"
        style={{
          boxShadow: '-8px -8px 16px rgba(255,255,255,0.9), 8px 8px 16px rgba(190,190,190,0.9)',
        }}
      >
        <h2 className="text-xl font-semibold text-[#4a4a4a] mb-6">New Habit</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate"
              className="w-full px-4 py-3 rounded-xl bg-[#e0e0e0] text-[#4a4a4a] placeholder-[#8a8a8a] outline-none"
              style={{
                boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)',
              }}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#6b6b6b] mb-2">
              Description <span className="text-[#8a8a8a]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[#e0e0e0] text-[#4a4a4a] placeholder-[#8a8a8a] outline-none resize-none"
              style={{
                boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)',
              }}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFrequencyType(type)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    frequencyType === type ? 'text-[#6b8cce]' : 'text-[#6b6b6b]'
                  }`}
                  style={{
                    boxShadow:
                      frequencyType === type
                        ? 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)'
                        : '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Weekly day selector */}
            {frequencyType === 'weekly' && (
              <div className="flex gap-1.5 mt-3">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedDays.includes(day) ? 'text-white' : 'text-[#6b6b6b]'
                    }`}
                    style={{
                      backgroundColor: selectedDays.includes(day) ? color : '#e0e0e0',
                      boxShadow: selectedDays.includes(day)
                        ? 'inset 1px 1px 2px rgba(0,0,0,0.15)'
                        : '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-[#6b6b6b] mb-2">
              Icon <span className="text-[#8a8a8a]">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(icon === emoji ? undefined : emoji)}
                  className="w-10 h-10 rounded-xl text-lg transition-all duration-200"
                  style={{
                    boxShadow:
                      icon === emoji
                        ? 'inset -2px -2px 4px rgba(255,255,255,0.8), inset 2px 2px 4px rgba(190,190,190,0.8)'
                        : '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[#6b6b6b] mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#4a4a4a]' : ''
                  }`}
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c
                        ? 'inset 1px 1px 2px rgba(0,0,0,0.2)'
                        : '-1px -1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(190,190,190,0.8)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-[#ce6b6b]">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-[#6b6b6b] bg-[#e0e0e0] transition-all duration-200"
              style={{
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: color,
                boxShadow: '-2px -2px 4px rgba(255,255,255,0.8), 2px 2px 4px rgba(190,190,190,0.8)',
              }}
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
