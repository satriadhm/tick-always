'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface TaskFiltersProps {
  completed: string | null;
  priority: string | null;
  search: string;
  onCompletedChange: (value: string | null) => void;
  onPriorityChange: (value: string | null) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function TaskFilters({
  completed,
  priority,
  search,
  onCompletedChange,
  onPriorityChange,
  onSearchChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = completed !== null || priority !== null || search !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            label="Search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={completed || ''}
            onChange={(e) => onCompletedChange(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="false">Incomplete</option>
            <option value="true">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priority || ''}
            onChange={(e) => onPriorityChange(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onClearFilters} className="w-full">
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

