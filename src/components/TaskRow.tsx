import { AlertTriangle, Check, Clock, Lock } from 'lucide-react';
import type { ReleaseTask } from '../types';
import { formatDisplayDate, getTaskUrgency } from '../utils/dateMath';

interface TaskRowProps {
  task: ReleaseTask;
  todayIso: string;
  onComplete: (taskId: string) => void;
}

export function TaskRow({ task, todayIso, onComplete }: TaskRowProps) {
  const urgency = getTaskUrgency(task, todayIso);
  const isOverdue = urgency.status === 'overdue';
  const isDueSoon = urgency.status === 'due-soon';

  const offsetLabel =
    task.offsetDays === null
      ? 'CUSTOM'
      : task.offsetDays === 0
        ? 'T-0'
        : `T${task.offsetDays}`;

  return (
    <div
      className={`group flex items-start gap-3 rounded-md border px-3 py-2.5 transition-colors ${
        task.completed
          ? 'border-[#262626]/60 bg-[#0A0A0A]/50 opacity-70'
          : isOverdue
            ? 'border-[#EF4444]/40 bg-[#EF4444]/[0.04]'
            : isDueSoon
              ? 'border-[#EF4444]/30 bg-[#0A0A0A]'
              : 'border-[#262626] bg-[#0A0A0A] hover:border-zinc-700'
      }`}
    >
      <button
        type="button"
        disabled={task.locked || task.completed}
        onClick={() => onComplete(task.id)}
        aria-label={
          task.completed
            ? `${task.title} (completed and locked)`
            : `Mark "${task.title}" complete`
        }
        title={
          task.completed
            ? 'Completed & locked'
            : 'Complete task (locks permanently)'
        }
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          task.completed
            ? 'cursor-default border-[#22C55E] bg-[#22C55E] text-[#0A0A0A]'
            : isOverdue || isDueSoon
              ? 'cursor-pointer border-[#EF4444]/70 bg-[#141414] text-transparent hover:border-[#22C55E] hover:bg-[#22C55E]/15 hover:text-[#22C55E]'
              : 'cursor-pointer border-zinc-600 bg-[#141414] text-transparent hover:border-[#22C55E] hover:bg-[#22C55E]/15 hover:text-[#22C55E]'
        }`}
      >
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
              task.completed
                ? 'bg-[#262626] text-zinc-500'
                : 'bg-[#262626] text-zinc-300'
            }`}
          >
            {offsetLabel}
          </span>

          <span className="font-mono text-[11px] text-zinc-500">
            {formatDisplayDate(task.dueDate)}
          </span>

          {task.locked && task.completed && (
            <span className="inline-flex items-center gap-1 rounded border border-[#22C55E]/30 bg-[#22C55E]/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#22C55E] uppercase">
              <Lock className="h-2.5 w-2.5" />
              Locked
            </span>
          )}

          {isOverdue && urgency.badgeText && (
            <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/40 bg-[#EF4444]/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#EF4444] uppercase">
              <AlertTriangle className="h-2.5 w-2.5" />
              {urgency.badgeText}
            </span>
          )}

          {isDueSoon && urgency.badgeText && (
            <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/40 bg-[#EF4444]/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#EF4444] uppercase">
              <Clock className="h-2.5 w-2.5" />
              {urgency.badgeText}
            </span>
          )}

          {urgency.status === 'upcoming' && urgency.badgeText && (
            <span className="font-mono text-[10px] text-zinc-500">
              {urgency.badgeText}
            </span>
          )}
        </div>

        <p
          className={`mt-1 text-sm leading-snug ${
            task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
          }`}
        >
          {task.title}
        </p>
      </div>
    </div>
  );
}
