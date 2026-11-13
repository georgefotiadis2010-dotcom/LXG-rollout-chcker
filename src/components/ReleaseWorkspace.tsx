import { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Megaphone,
  Package,
  Plus,
  Radio,
  Trash2,
} from 'lucide-react';
import type { Release, TaskPhase } from '../types';
import {
  formatDisplayDate,
  getReleaseCountdown,
  getTaskUrgency,
} from '../utils/dateMath';
import { TASK_PHASES } from '../utils/scheduleGenerator';
import { TaskRow } from './TaskRow';

interface ReleaseWorkspaceProps {
  release: Release;
  todayIso: string;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  onCompleteTask: (releaseId: string, taskId: string) => void;
  onAddCustomTask: (
    releaseId: string,
    title: string,
    dueDate: string,
    phase: TaskPhase
  ) => void;
  onDeleteRelease: (releaseId: string) => void;
}

const PHASE_ICON: Record<TaskPhase, typeof Package> = {
  'Distribution & Metadata': Package,
  'Editorial & Radio': Radio,
  'Content & Promo': Megaphone,
};

export function ReleaseWorkspace({
  release,
  todayIso,
  hideCompleted,
  onToggleHideCompleted,
  onCompleteTask,
  onAddCustomTask,
  onDeleteRelease,
}: ReleaseWorkspaceProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState(release.releaseDate);
  const [customPhase, setCustomPhase] = useState<TaskPhase>('Content & Promo');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalTasks = release.tasks.length;
  const completedTasks = release.tasks.filter((t) => t.completed).length;
  const completionPct =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const overdueCount = release.tasks.filter(
    (t) => getTaskUrgency(t, todayIso).status === 'overdue'
  ).length;
  const dueSoonCount = release.tasks.filter(
    (t) => getTaskUrgency(t, todayIso).status === 'due-soon'
  ).length;

  const countdown = getReleaseCountdown(release.releaseDate, todayIso);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDate) return;
    onAddCustomTask(release.id, customTitle.trim(), customDate, customPhase);
    setCustomTitle('');
  };

  return (
    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Release Header Card */}
        <section className="rounded-lg border border-[#262626] bg-[#141414] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                  {release.title}
                </h1>
                <span className="rounded border border-[#262626] bg-[#0A0A0A] px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  {release.releaseType}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-xs font-bold tracking-wider uppercase ${
                    countdown.isReleased
                      ? 'bg-[#262626] text-zinc-400'
                      : countdown.daysRemaining <= 2
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'bg-[#22C55E]/15 text-[#22C55E]'
                  }`}
                >
                  {countdown.label}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                Release Date: {formatDisplayDate(release.releaseDate)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      onDeleteRelease(release.id);
                    }}
                    className="rounded border border-[#EF4444]/60 bg-[#EF4444]/20 px-2.5 py-1 text-xs font-bold text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded border border-[#262626] bg-[#0A0A0A] px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  aria-label={`Delete release ${release.title}`}
                  className="inline-flex items-center gap-1.5 rounded border border-[#262626] bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Progress & Urgency Summary */}
          <div className="mt-5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-300">
                  {completedTasks} / {totalTasks} completed
                </span>
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#EF4444]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {overdueCount} overdue
                  </span>
                )}
                {dueSoonCount > 0 && (
                  <span className="font-mono font-semibold text-[#EF4444]">
                    {dueSoonCount} due &le;48h
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold text-[#22C55E]">
                {completionPct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#262626]">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Controls: Add Custom Task + Hide Completed Toggle */}
        <section className="rounded-lg border border-[#262626] bg-[#141414] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleCustomSubmit}
              className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
            >
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="+ Add custom task..."
                aria-label="Custom task title"
                className="min-w-0 flex-1 rounded border border-[#262626] bg-[#0A0A0A] px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:border-[#22C55E] focus:outline-none"
              />
              <select
                value={customPhase}
                onChange={(e) => setCustomPhase(e.target.value as TaskPhase)}
                aria-label="Custom task phase"
                className="rounded border border-[#262626] bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-zinc-200 focus:border-[#22C55E] focus:outline-none"
              >
                {TASK_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                aria-label="Custom task due date"
                className="rounded border border-[#262626] bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 rounded bg-[#22C55E] px-3 py-1.5 text-xs font-bold tracking-wider text-[#0A0A0A] uppercase transition-colors hover:bg-[#16A34A]"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Add
              </button>
            </form>

            <button
              type="button"
              onClick={onToggleHideCompleted}
              aria-pressed={hideCompleted}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                hideCompleted
                  ? 'border-[#22C55E]/60 bg-[#22C55E]/15 text-[#22C55E]'
                  : 'border-[#262626] bg-[#0A0A0A] text-zinc-300 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {hideCompleted ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              Hide Completed Tasks
            </button>
          </div>
        </section>

        {/* Grouped Phase Checklists */}
        <div className="space-y-4">
          {TASK_PHASES.map((phase) => {
            const PhaseIcon = PHASE_ICON[phase];
            const phaseTasks = release.tasks
              .filter((t) => t.phase === phase)
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
            const visibleTasks = hideCompleted
              ? phaseTasks.filter((t) => !t.completed)
              : phaseTasks;
            const phaseCompleted = phaseTasks.filter((t) => t.completed).length;

            return (
              <section
                key={phase}
                className="rounded-lg border border-[#262626] bg-[#141414] p-4"
              >
                <div className="mb-3 flex items-center justify-between border-b border-[#262626] pb-2.5">
                  <div className="flex items-center gap-2">
                    <PhaseIcon className="h-4 w-4 text-[#22C55E]" />
                    <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">
                      {phase}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-zinc-400">
                    {phaseCompleted}/{phaseTasks.length}
                  </span>
                </div>

                {visibleTasks.length === 0 ? (
                  <p className="py-2 text-xs text-zinc-500">
                    {phaseTasks.length === 0
                      ? 'No tasks in this phase.'
                      : 'All tasks in this phase are completed and hidden.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visibleTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        todayIso={todayIso}
                        onComplete={(taskId) =>
                          onCompleteTask(release.id, taskId)
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
