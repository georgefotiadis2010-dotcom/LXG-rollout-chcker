import type { Release, ReleaseTask, ReleaseType, TaskPhase } from '../types';
import { addDaysToIso, getTodayLocalIso } from './dateMath';

export const TASK_PHASES: readonly TaskPhase[] = [
  'Distribution & Metadata',
  'Editorial & Radio',
  'Content & Promo',
] as const;

interface ScheduleTemplateItem {
  offsetDays: number; // negative or 0 relative to releaseDate
  phase: TaskPhase;
  title: string;
}

const REVERSE_SCHEDULE_TEMPLATE: readonly ScheduleTemplateItem[] = [
  {
    offsetDays: -28,
    phase: 'Distribution & Metadata',
    title: 'Final master WAV (24-bit/44.1kHz) & cover art (3000x3000px) locked.',
  },
  {
    offsetDays: -21,
    phase: 'Distribution & Metadata',
    title: 'Upload release to LANDR for distribution & set ISRC codes.',
  },
  {
    offsetDays: -14,
    phase: 'Editorial & Radio',
    title:
      'Submit Spotify for Artists editorial pitch & upload track to triple j Unearthed.',
  },
  {
    offsetDays: -10,
    phase: 'Content & Promo',
    title:
      'Upload time-synced lyrics to Musixmatch & set up Spotify Canvas / Apple Music motion art.',
  },
  {
    offsetDays: -7,
    phase: 'Content & Promo',
    title:
      'Batch-film 3–5 short-form vertical teasers (Reels/TikTok) with pre-save link in bio.',
  },
  {
    offsetDays: -3,
    phase: 'Content & Promo',
    title:
      'Send private streaming link to close supporters & post final countdown teaser.',
  },
  {
    offsetDays: -1,
    phase: 'Distribution & Metadata',
    title:
      'Final check across Spotify, Apple Music, and Instagram Audio libraries.',
  },
  {
    offsetDays: 0,
    phase: 'Content & Promo',
    title:
      'Publish release post, update lxgmusic.com links, and push to personal playlists.',
  },
] as const;

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Deterministically generate chronological release tasks by subtracting fixed day
 * offsets from the target releaseDate (YYYY-MM-DD).
 */
export function generateReverseSchedule(
  releaseDateIso: string,
  releaseId: string
): ReleaseTask[] {
  return REVERSE_SCHEDULE_TEMPLATE.map((item) => ({
    id: `${releaseId}-t${item.offsetDays}`,
    title: item.title,
    phase: item.phase,
    dueDate: addDaysToIso(releaseDateIso, item.offsetDays),
    offsetDays: item.offsetDays,
    completed: false,
    locked: false,
    isCustom: false,
  }));
}

/** Create a new Release with a deterministic reverse-scheduled checklist. */
export function createRelease(
  title: string,
  releaseDate: string,
  releaseType: ReleaseType,
  fixedId?: string
): Release {
  const id = fixedId ?? makeId('rel');
  return {
    id,
    title: title.trim(),
    releaseDate,
    releaseType,
    createdAt: getTodayLocalIso(),
    tasks: generateReverseSchedule(releaseDate, id),
  };
}

/** Create a custom task inside an existing release. */
export function createCustomTask(
  title: string,
  dueDate: string,
  phase: TaskPhase
): ReleaseTask {
  return {
    id: makeId('task'),
    title: title.trim(),
    phase,
    dueDate,
    offsetDays: null,
    completed: false,
    locked: false,
    isCustom: true,
  };
}

/** Pre-populated sample releases for first-time launch. */
export function createInitialReleases(): Release[] {
  return [
    createRelease('I KNOW', '2026-11-27', 'Single', 'rel-i-know'),
    createRelease('WATCH', '2027-01-15', 'Single', 'rel-watch'),
  ];
}
