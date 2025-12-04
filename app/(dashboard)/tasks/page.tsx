'use client';

import { useSearchParams } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';

export default function TasksPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  return <TaskList initialFilter={filter} />;
}
