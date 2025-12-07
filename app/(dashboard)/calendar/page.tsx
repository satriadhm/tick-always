'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import CalendarMonthView from '@/components/calendar/CalendarMonthView';
import TaskList from '@/components/tasks/TaskList';

interface CalendarTask {
  id: string;
  title: string;
  priority: 'none' | 'low' | 'medium' | 'high';
  completed: boolean;
}

interface CalendarDay {
  date: string;
  tasks: CalendarTask[];
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize date from URL params after mount
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          setCurrentDate(parsedDate);
        }
      } catch {
        // Invalid date, use current date
      }
    }
  }, [searchParams]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const params = new URLSearchParams({
        view: viewMode,
        date: dateStr,
        hideCompleted: hideCompleted.toString(),
      });

      const response = await fetch(`/api/calendar?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setCalendarData(data.data.days);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, hideCompleted, viewMode]);

  const handlePrevious = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    updateURL(newDate);
  };

  const handleNext = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    updateURL(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    updateURL(today);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    updateURL(date);
  };

  const handleDayDoubleClick = (date: Date) => {
    // Open add task modal with pre-filled date
    // This will be implemented when we add the task creation modal
    router.push(`/tasks?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const updateURL = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', format(date, 'yyyy-MM-dd'));
    router.push(`/calendar?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="h-full bg-[#F7F7F7]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <CalendarToolbar
          currentDate={currentDate}
          viewMode={viewMode}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onViewModeChange={setViewMode}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E7BFA]"></div>
              </div>
            ) : (
              <CalendarMonthView
                currentDate={currentDate}
                days={calendarData}
                onDayClick={handleDayClick}
                onDayDoubleClick={handleDayDoubleClick}
                selectedDate={selectedDate}
              />
            )}
          </div>

          {/* Task List for Selected Date */}
          <div className="lg:col-span-1">
            {selectedDate ? (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <TaskList
                  dateFilter={format(selectedDate, 'yyyy-MM-dd')}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-gray-500 text-center py-8">
                  Select a date to view tasks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main calendar page component with Suspense boundary
export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="h-full bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E7BFA]"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  );
}