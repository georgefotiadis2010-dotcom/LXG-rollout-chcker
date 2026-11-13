import { useRef } from 'react';
import { Disc3, Download, Plus, Upload } from 'lucide-react';
import type { Release } from '../types';
import { formatDisplayDate, getReleaseCountdown } from '../utils/dateMath';

interface ReleaseSidebarProps {
  releases: Release[];
  selectedReleaseId: string | null;
  todayIso: string;
  backupNotice: { type: 'success' | 'error'; message: string } | null;
  onSelectRelease: (id: string) => void;
  onOpenNewRelease: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export function ReleaseSidebar({
  releases,
  selectedReleaseId,
  todayIso,
  backupNotice,
  onSelectRelease,
  onOpenNewRelease,
  onExportJson,
  onImportJson,
}: ReleaseSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#262626] bg-[#0A0A0A] lg:h-screen lg:sticky lg:top-0 lg:w-80 lg:border-r lg:border-b-0">
      {/* Brand & New Release CTA */}
      <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#262626] bg-[#141414]">
            <Disc3 className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-white uppercase">
              LXG Release
            </div>
            <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              Command Center
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewRelease}
          className="inline-flex items-center gap-1 rounded bg-[#22C55E] px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-[#0A0A0A] uppercase transition-colors hover:bg-[#16A34A]"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          New Release
        </button>
      </div>

      {/* Release Switcher List (horizontal scroll on mobile, vertical stack on lg) */}
      <div className="flex gap-2.5 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
        {releases.length === 0 ? (
          <div className="w-full rounded-md border border-dashed border-[#262626] bg-[#141414] p-4 text-center text-xs text-zinc-500">
            No releases logged. Click <strong>+ New Release</strong> to start.
          </div>
        ) : (
          releases.map((release) => {
            const isSelected = release.id === selectedReleaseId;
            const total = release.tasks.length;
            const completed = release.tasks.filter((t) => t.completed).length;
            const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
            const countdown = getReleaseCountdown(release.releaseDate, todayIso);

            return (
              <button
                key={release.id}
                type="button"
                onClick={() => onSelectRelease(release.id)}
                className={`min-w-[230px] shrink-0 rounded-md border p-3 text-left transition-colors lg:min-w-0 lg:w-full ${
                  isSelected
                    ? 'border-[#22C55E] bg-[#141414]'
                    : 'border-[#262626] bg-[#141414]/60 hover:border-zinc-700 hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold tracking-wide text-white uppercase">
                        {release.title}
                      </span>
                      <span className="shrink-0 rounded border border-[#262626] bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-zinc-400 uppercase">
                        {release.releaseType}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      {formatDisplayDate(release.releaseDate)}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
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

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-zinc-400">
                    <span>
                      {completed}/{total} tasks
                    </span>
                    <span className="font-semibold text-[#22C55E]">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#262626]">
                    <div
                      className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* JSON Backup Controls */}
      <div className="border-t border-[#262626] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#262626] bg-[#141414] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#262626] bg-[#141414] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Import releases JSON backup"
          />
        </div>
        {backupNotice && (
          <p
            className={`mt-2 text-[11px] ${
              backupNotice.type === 'error'
                ? 'text-[#EF4444]'
                : 'text-[#22C55E]'
            }`}
          >
            {backupNotice.message}
          </p>
        )}
      </div>
    </aside>
  );
}
