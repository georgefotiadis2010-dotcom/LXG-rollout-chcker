import type { ReleaseTask } from '../types';

const MS_PER_DAY = 86_400_000;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export interface PlainDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

/** Parse a YYYY-MM-DD string into integer calendar parts without timezone drift. */
export function parseIsoDate(iso: string): PlainDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) {
    throw new Error(`Invalid ISO calendar date: "${iso}"`);
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Format integer calendar parts as YYYY-MM-DD. */
export function formatIsoDate(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Add or subtract calendar days from a YYYY-MM-DD string deterministically. */
export function addDaysToIso(iso: string, deltaDays: number): string {
  const { year, month, day } = parseIsoDate(iso);
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return formatIsoDate(
    utc.getUTCFullYear(),
    utc.getUTCMonth() + 1,
    utc.getUTCDate()
  );
}

/** Compute exact calendar day difference (toIso - fromIso). */
export function diffDaysIso(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  const fromMs = Date.UTC(from.year, from.month - 1, from.day);
  const toMs = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/** Return today's local calendar date as YYYY-MM-DD. */
export function getTodayLocalIso(): string {
  const now = new Date();
  return formatIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Format YYYY-MM-DD for compact display (e.g. "Nov 27, 2026") without timezone drift. */
export function formatDisplayDate(iso: string): string {
  const { year, month, day } = parseIsoDate(iso);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export interface ReleaseCountdown {
  label: string;
  daysRemaining: number;
  isReleased: boolean;
  isReleaseDay: boolean;
}

/** Compute live countdown status for a release relative to todayIso. */
export function getReleaseCountdown(
  releaseDateIso: string,
  todayIso: string
): ReleaseCountdown {
  const daysRemaining = diffDaysIso(todayIso, releaseDateIso);
  if (daysRemaining < 0) {
    return {
      label: 'Released',
      daysRemaining,
      isReleased: true,
      isReleaseDay: false,
    };
  }
  if (daysRemaining === 0) {
    return {
      label: 'Release Day',
      daysRemaining: 0,
      isReleased: false,
      isReleaseDay: true,
    };
  }
  return {
    label: `${daysRemaining}d left`,
    daysRemaining,
    isReleased: false,
    isReleaseDay: false,
  };
}

export type TaskUrgencyStatus = 'completed' | 'overdue' | 'due-soon' | 'upcoming';

export interface TaskUrgencyInfo {
  status: TaskUrgencyStatus;
  badgeText: string | null;
  daysUntilDue: number;
}

/**
 * Determine task urgency relative to todayIso:
 * - Past-due uncompleted tasks -> 'overdue' ("Overdue / Immediate Action")
 * - Uncompleted tasks due within 48 hours (0..2 days) -> 'due-soon'
 * - Future tasks (> 2 days away) -> 'upcoming'
 */
export function getTaskUrgency(
  task: ReleaseTask,
  todayIso: string
): TaskUrgencyInfo {
  const daysUntilDue = diffDaysIso(todayIso, task.dueDate);
  if (task.completed) {
    return {
      status: 'completed',
      badgeText: null,
      daysUntilDue,
    };
  }
  if (daysUntilDue < 0) {
    return {
      status: 'overdue',
      badgeText: 'Overdue / Immediate Action',
      daysUntilDue,
    };
  }
  if (daysUntilDue === 0) {
    return {
      status: 'due-soon',
      badgeText: 'Due Today',
      daysUntilDue,
    };
  }
  if (daysUntilDue <= 2) {
    return {
      status: 'due-soon',
      badgeText: `Due in ${daysUntilDue * 24}h`,
      daysUntilDue,
    };
  }
  return {
    status: 'upcoming',
    badgeText: `In ${daysUntilDue}d`,
    daysUntilDue,
  };
}
