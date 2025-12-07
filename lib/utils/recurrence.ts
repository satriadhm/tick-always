import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  isBefore,
  isAfter,
  format,
  parseISO,
} from 'date-fns';
import { RecurrenceRule } from '@/types';

export interface TaskInstance {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  completed: boolean;
  isRecurring: boolean;
  parentTaskId: string;
  occurrenceDate: Date;
  isGenerated: boolean;
  recurrenceIndex?: number;
}

/**
 * Helper: Convert date to date-only string (yyyy-MM-dd)
 */
function dateKey(dt: Date): string {
  return format(startOfDay(dt), 'yyyy-MM-dd');
}

/**
 * Helper: Convert date input to Date object
 */
function toDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  return typeof d === 'string' ? parseISO(d) : d;
}


/**
 * Generate recurring task instances for a date range
 * Enhanced with exceptions support and performance optimizations
 */
export function generateRecurrenceInstances(
  task: {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | string | null;
    priority: 'none' | 'low' | 'medium' | 'high';
    tags: string[];
    completed: boolean;
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule;
  },
  startDate: Date,
  endDate: Date
): TaskInstance[] {
  if (!task.isRecurring || !task.recurrenceRule || !task.dueDate) {
    return [];
  }

  const rule = task.recurrenceRule;
  const baseDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
  const seedDate = startOfDay(baseDate);
  const from = startOfDay(startDate);
  const to = startOfDay(endDate);

  // Check if we should generate instances
  if (rule.endDate) {
    const endDateObj = toDate(rule.endDate);
    if (endDateObj && isBefore(endDateObj, from)) {
      return [];
    }
  }

  // Get exceptions as date keys
  const exceptions = (rule.exceptions || []).map((e) => {
    const d = toDate(e);
    return d ? dateKey(d) : null;
  }).filter((k): k is string => k !== null);

  const instances: TaskInstance[] = [];
  const interval = rule.interval || 1;
  const occurrences = 0;
  const safety = 0;

  // Generate instances based on recurrence type
  switch (rule.type) {
    case 'daily':
      instances.push(...generateDailyInstances(task, seedDate, from, to, rule, interval, exceptions, occurrences, safety));
      break;
    case 'weekly':
      instances.push(...generateWeeklyInstances(task, seedDate, from, to, rule, interval, exceptions, occurrences, safety));
      break;
    case 'monthly':
      instances.push(...generateMonthlyInstances(task, seedDate, from, to, rule, interval, exceptions, occurrences, safety));
      break;
    case 'yearly':
      instances.push(...generateYearlyInstances(task, seedDate, from, to, rule, interval, exceptions, occurrences, safety));
      break;
    case 'custom':
      instances.push(...generateCustomInstances(task, seedDate, from, to, rule, interval, exceptions, occurrences, safety));
      break;
  }

  return instances;
}

interface TaskInput {
  id: string;
  title: string;
  description?: string;
  priority: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
}

function generateDailyInstances(
  task: TaskInput,
  seedDate: Date,
  from: Date,
  to: Date,
  rule: RecurrenceRule,
  interval: number,
  exceptions: string[],
  occurrences: number,
  safety: number
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  let current = seedDate;
  let count = occurrences;
  let iter = safety;

  // Fast-forward to near 'from' for performance
  if (isBefore(current, from)) {
    const daysDiff = Math.max(0, Math.floor((from.getTime() - current.getTime()) / (24 * 60 * 60 * 1000)));
    const skip = Math.floor(daysDiff / interval);
    current = addDays(current, skip * interval);
  }

  while (!isAfter(current, to) && iter++ < 5000) {
    const key = dateKey(current);

    // Check end date
    if (rule.endDate) {
      const endDateObj = toDate(rule.endDate);
      if (endDateObj && isAfter(current, endDateObj)) break;
    }

    // Check exceptions
    if (exceptions.includes(key)) {
      current = addDays(current, interval);
      continue;
    }

    // Check if within range
    if (!isBefore(current, from)) {
      instances.push(createInstance(task, current, count));
      count++;
      if (rule.count && count >= rule.count) break;
    }

    current = addDays(current, interval);
  }

  return instances;
}

function generateWeeklyInstances(
  task: TaskInput,
  seedDate: Date,
  from: Date,
  to: Date,
  rule: RecurrenceRule,
  interval: number,
  exceptions: string[],
  occurrences: number,
  safety: number
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  
  // Map day names to numbers (0=Sunday, 6=Saturday)
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  let targetDays: number[];
  if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    targetDays = rule.daysOfWeek
      .map((day) => dayMap[day.toLowerCase()])
      .filter((d) => d !== undefined)
      .sort();
  } else {
    // If no specific days, use the seed date's day of week
    targetDays = [seedDate.getDay()];
  }

  if (targetDays.length === 0) return instances;

  // Start from the week containing 'from'
  let weekStart = startOfWeek(from, { weekStartsOn: 0 });
  let count = occurrences;
  let iter = safety;

  while (!isAfter(weekStart, to) && iter++ < 5000) {
    for (const dayOfWeek of targetDays) {
      const occ = addDays(weekStart, dayOfWeek);
      const key = dateKey(occ);

      // Check if within range
      if (isBefore(occ, from)) continue;
      if (isAfter(occ, to)) continue;

      // Check end date
      if (rule.endDate) {
        const endDateObj = toDate(rule.endDate);
        if (endDateObj && isAfter(occ, endDateObj)) continue;
      }

      // Check exceptions
      if (exceptions.includes(key)) continue;

      instances.push(createInstance(task, occ, count));
      count++;
      if (rule.count && count >= rule.count) break;
    }

    if (rule.count && count >= rule.count) break;
    weekStart = addWeeks(weekStart, interval);
  }

  return instances;
}

function generateMonthlyInstances(
  task: TaskInput,
  seedDate: Date,
  from: Date,
  to: Date,
  rule: RecurrenceRule,
  interval: number,
  exceptions: string[],
  occurrences: number,
  safety: number
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  let monthCursor = startOfMonth(seedDate);
  const byDays = rule.dayOfMonth ? [rule.dayOfMonth] : [seedDate.getDate()];
  let count = occurrences;
  let iter = safety;

  // Fast-forward to near 'from'
  while (isBefore(monthCursor, from) && iter++ < 100) {
    monthCursor = addMonths(monthCursor, interval);
  }

  iter = safety;
  while (!isAfter(monthCursor, to) && iter++ < 5000) {
    for (const dayOfMonth of byDays) {
      const year = monthCursor.getFullYear();
      const month = monthCursor.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      const day = Math.min(dayOfMonth, lastDay);

      const occ = new Date(year, month, day);
      if (isNaN(occ.getTime())) continue;

      const key = dateKey(occ);

      // Check if within range
      if (isBefore(occ, from)) continue;
      if (isAfter(occ, to)) continue;

      // Check end date
      if (rule.endDate) {
        const endDateObj = toDate(rule.endDate);
        if (endDateObj && isAfter(occ, endDateObj)) continue;
      }

      // Check exceptions
      if (exceptions.includes(key)) continue;

      instances.push(createInstance(task, occ, count));
      count++;
      if (rule.count && count >= rule.count) break;
    }

    if (rule.count && count >= rule.count) break;
    monthCursor = addMonths(monthCursor, interval);
  }

  return instances;
}

function generateYearlyInstances(
  task: TaskInput,
  seedDate: Date,
  from: Date,
  to: Date,
  rule: RecurrenceRule,
  interval: number,
  exceptions: string[],
  occurrences: number,
  safety: number
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  let yearCursor = startOfYear(seedDate);
  let count = occurrences;
  let iter = safety;

  // Fast-forward to near 'from'
  while (isBefore(yearCursor, from) && iter++ < 50) {
    yearCursor = addYears(yearCursor, interval);
  }

  iter = safety;
  while (!isAfter(yearCursor, to) && iter++ < 5000) {
    // Use month/day from seed or rule
    const month = rule.month !== undefined ? rule.month - 1 : seedDate.getMonth();
    const day = rule.day !== undefined ? rule.day : seedDate.getDate();
    const year = yearCursor.getFullYear();

    // Handle invalid dates (e.g., Feb 30)
    const lastDay = new Date(year, month + 1, 0).getDate();
    const validDay = Math.min(day, lastDay);

    const occ = new Date(year, month, validDay);
    if (isNaN(occ.getTime())) {
      yearCursor = addYears(yearCursor, interval);
      continue;
    }

    const key = dateKey(occ);

    // Check if within range
    if (isBefore(occ, from)) {
      yearCursor = addYears(yearCursor, interval);
      continue;
    }
    if (isAfter(occ, to)) break;

    // Check end date
    if (rule.endDate) {
      const endDateObj = toDate(rule.endDate);
      if (endDateObj && isAfter(occ, endDateObj)) break;
    }

    // Check exceptions
    if (exceptions.includes(key)) {
      yearCursor = addYears(yearCursor, interval);
      continue;
    }

    instances.push(createInstance(task, occ, count));
    count++;
    if (rule.count && count >= rule.count) break;

    yearCursor = addYears(yearCursor, interval);
  }

  return instances;
}

function generateCustomInstances(
  task: TaskInput,
  seedDate: Date,
  from: Date,
  to: Date,
  rule: RecurrenceRule,
  interval: number,
  exceptions: string[],
  occurrences: number,
  safety: number
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  
  if (!rule.unit) return instances;

  let current = seedDate;
  let count = occurrences;
  let iter = safety;

  // Fast-forward to near 'from'
  while (isBefore(current, from) && iter++ < 100) {
    switch (rule.unit) {
      case 'day':
        current = addDays(current, interval);
        break;
      case 'week':
        current = addWeeks(current, interval);
        break;
      case 'month':
        current = addMonths(current, interval);
        break;
      case 'year':
        current = addYears(current, interval);
        break;
    }
  }

  iter = safety;
  while ((!isAfter(current, to) || dateKey(current) === dateKey(to)) && iter++ < 5000) {
    const key = dateKey(current);

    // Check end date
    if (rule.endDate) {
      const endDateObj = toDate(rule.endDate);
      if (endDateObj && isAfter(current, endDateObj)) break;
    }

    // Check exceptions
    if (!exceptions.includes(key) && !isBefore(current, from)) {
      instances.push(createInstance(task, current, count));
      count++;
      if (rule.count && count >= rule.count) break;
    }

    switch (rule.unit) {
      case 'day':
        current = addDays(current, interval);
        break;
      case 'week':
        current = addWeeks(current, interval);
        break;
      case 'month':
        current = addMonths(current, interval);
        break;
      case 'year':
        current = addYears(current, interval);
        break;
    }
  }

  return instances;
}

function createInstance(task: TaskInput, date: Date, index: number): TaskInstance {
  return {
    id: `${task.id}::${dateKey(date)}`,
    title: task.title,
    description: task.description,
    dueDate: date,
    priority: task.priority,
    tags: task.tags,
    completed: false,
    isRecurring: false,
    parentTaskId: task.id,
    occurrenceDate: date,
    isGenerated: true,
    recurrenceIndex: index,
  };
}
