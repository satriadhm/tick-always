'use client';

import { useState, useEffect, useCallback } from 'react';
import TaskItem from './TaskItem';
import AddTaskComposer from './AddTaskComposer';
import TaskDetailPanel from './TaskDetailPanel';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  completed: boolean;
  completedAt?: string | null;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  initialFilter?: string | null;
  dateFilter?: string; // YYYY-MM-DD format for calendar integration
}

export default function TaskList({ initialFilter, dateFilter: dateFilterProp }: TaskListProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Filters
  const [completed, setCompleted] = useState<string | null>(null);
  const [priority] = useState<string | null>(null);
  const [search] = useState('');
  const [sortBy] = useState('dueDate');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Get page title based on filter
  const getPageTitle = () => {
    if (initialFilter === 'today') return 'Today';
    if (initialFilter === 'week') return 'Next 7 Days';
    return 'Tasks';
  };

  // Initialize filters based on URL
  useEffect(() => {
    if (dateFilterProp) {
      // Calendar date filter (single date)
      const date = new Date(dateFilterProp);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setDateFilter({
        from: date.toISOString(),
        to: nextDay.toISOString(),
      });
      setCompleted('false');
    } else if (initialFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDateFilter({
        from: today.toISOString(),
        to: tomorrow.toISOString(),
      });
      setCompleted('false');
    } else if (initialFilter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDateFilter({
        from: today.toISOString(),
        to: nextWeek.toISOString(),
      });
      setCompleted('false');
    }
  }, [initialFilter, dateFilterProp]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (completed !== null) params.append('completed', completed);
      if (priority) params.append('priority', priority);
      if (search) params.append('search', search);
      if (dateFilter?.from) params.append('dueDateFrom', dateFilter.from);
      if (dateFilter?.to) params.append('dueDateTo', dateFilter.to);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/tasks?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setTasks(data.data.tasks);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch {
      setError('An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  }, [completed, priority, search, sortBy, sortOrder, page, dateFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleQuickAddTask = async (data: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'none' | 'low' | 'medium' | 'high';
    tags?: string[];
  }) => {
    setError('');
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          priority: data.priority || 'none',
          tags: data.tags || [],
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Reset to page 1 to ensure new task is visible
        setPage(1);
        // Refresh the task list to show the new task
        await fetchTasks();
      } else {
        setError(responseData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('An error occurred while creating task');
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTasks();
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch {
      setError('An error occurred while updating task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        if (selectedTaskId === id) {
          setSelectedTaskId(null);
        }
        fetchTasks();
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch {
      setError('An error occurred while deleting task');
    }
  };

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id);
  };

  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);

  return (
    <div className="flex h-full bg-[var(--bg-base)]">
      {/* Main Content Area - 760px max-width, centered */}
      <div
        className={`flex-1 transition-all duration-200 ${
          selectedTaskId ? 'mr-[480px]' : ''
        }`}
      >
        <div className="max-w-[760px] mx-auto px-6 py-6">
          {/* Page Title Row */}
          <div className="sticky top-0 bg-[var(--bg-base)] z-10 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
              <div className="flex items-center gap-2">
                {/* Sort Button */}
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Sort"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                </button>
                {/* Filter Button */}
                <button
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    priority || completed || search ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  title="Filter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E7BFA]"></div>
              <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onClick={handleTaskClick}
                />
              ))}
            </div>
          )}

          {/* Show Completed Toggle */}
          {tasks.some((t) => t.completed) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {showCompleted ? 'Hide' : 'Show'} completed ({tasks.filter((t) => t.completed).length})
              </button>
            </div>
          )}

          {/* Add Task Composer */}
          <div className="mt-4">
            <AddTaskComposer onAddTask={handleQuickAddTask} />
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={fetchTasks}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
