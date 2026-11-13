export type ReleaseType = 'Single' | 'EP';

export type TaskPhase =
  | 'Distribution & Metadata'
  | 'Editorial & Radio'
  | 'Content & Promo';

export interface ReleaseTask {
  id: string;
  title: string;
  phase: TaskPhase;
  dueDate: string; // YYYY-MM-DD
  offsetDays: number | null; // e.g. -28..0 for generated tasks, null for custom
  completed: boolean;
  locked: boolean; // Locked once completed so it is never re-suggested
  completedAt?: string;
  isCustom?: boolean;
}

export interface Release {
  id: string;
  title: string;
  releaseDate: string; // YYYY-MM-DD
  releaseType: ReleaseType;
  createdAt: string;
  tasks: ReleaseTask[];
}
