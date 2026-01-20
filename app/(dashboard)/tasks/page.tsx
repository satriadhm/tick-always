'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';

function TasksContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  return <TaskList initialFilter={filter} />;
}

// Force dynamic rendering since we use searchParams
export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="h-full bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E7BFA]"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
