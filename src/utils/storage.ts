import type { Release, ReleaseTask, ReleaseType, TaskPhase } from '../types';
import { createInitialReleases, TASK_PHASES } from './scheduleGenerator';

const STORAGE_KEY = 'lxg-release-command-center:v1';

const VALID_RELEASE_TYPES: readonly ReleaseType[] = ['Single', 'EP'];

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTask(raw: unknown): raw is ReleaseTask {
  if (!raw || typeof raw !== 'object') return false;
  const t = raw as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.phase === 'string' &&
    (TASK_PHASES as readonly string[]).includes(t.phase as TaskPhase) &&
    isValidIsoDate(t.dueDate) &&
    typeof t.completed === 'boolean' &&
    typeof t.locked === 'boolean'
  );
}

function isValidRelease(raw: unknown): raw is Release {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    isValidIsoDate(r.releaseDate) &&
    typeof r.releaseType === 'string' &&
    (VALID_RELEASE_TYPES as readonly string[]).includes(r.releaseType) &&
    Array.isArray(r.tasks) &&
    r.tasks.every(isValidTask)
  );
}

export function loadReleases(): Release[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialReleases();
      saveReleases(initial);
      return initial;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isValidRelease)) {
      const initial = createInitialReleases();
      saveReleases(initial);
      return initial;
    }
    return parsed;
  } catch {
    return createInitialReleases();
  }
}

export function saveReleases(releases: Release[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export function exportReleasesJson(releases: Release[]): string {
  return JSON.stringify(
    {
      app: 'LXG Release Command Center',
      version: 1,
      exportedAt: new Date().toISOString(),
      releases,
    },
    null,
    2
  );
}

export function parseImportedReleasesJson(rawJson: string): Release[] {
  const parsed: unknown = JSON.parse(rawJson);
  const list = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as Record<string, unknown>).releases)
      ? (parsed as Record<string, unknown>).releases
      : null;

  if (!Array.isArray(list) || !list.every(isValidRelease)) {
    throw new Error(
      'Invalid backup file. Expected an LXG Release Command Center JSON export.'
    );
  }
  return list;
}
