import { useEffect, useState } from 'react';
import { Disc3, Plus } from 'lucide-react';
import { NewReleaseModal } from './components/NewReleaseModal';
import { ReleaseSidebar } from './components/ReleaseSidebar';
import { ReleaseWorkspace } from './components/ReleaseWorkspace';
import type { Release, ReleaseType, TaskPhase } from './types';
import { getTodayLocalIso } from './utils/dateMath';
import { createCustomTask, createRelease } from './utils/scheduleGenerator';
import {
  exportReleasesJson,
  loadReleases,
  parseImportedReleasesJson,
  saveReleases,
} from './utils/storage';

export function App() {
  const [releases, setReleases] = useState<Release[]>(() => loadReleases());
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(
    () => loadReleases()[0]?.id ?? null
  );
  const [todayIso, setTodayIso] = useState<string>(() => getTodayLocalIso());
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    saveReleases(releases);
  }, [releases]);

  useEffect(() => {
    const refreshDate = () => setTodayIso(getTodayLocalIso());
    const interval = window.setInterval(refreshDate, 60_000);
    window.addEventListener('focus', refreshDate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshDate);
    };
  }, []);

  const selectedRelease =
    releases.find((r) => r.id === selectedReleaseId) ?? releases[0] ?? null;

  const handleCreateRelease = (
    title: string,
    releaseDate: string,
    releaseType: ReleaseType
  ) => {
    const newRelease = createRelease(title, releaseDate, releaseType);
    setReleases((prev) => [newRelease, ...prev]);
    setSelectedReleaseId(newRelease.id);
  };

  const handleCompleteTask = (releaseId: string, taskId: string) => {
    setReleases((prev) =>
      prev.map((rel) => {
        if (rel.id !== releaseId) return rel;
        return {
          ...rel,
          tasks: rel.tasks.map((t) =>
            t.id === taskId && !t.locked
              ? {
                  ...t,
                  completed: true,
                  locked: true,
                  completedAt: getTodayLocalIso(),
                }
              : t
          ),
        };
      })
    );
  };

  const handleAddCustomTask = (
    releaseId: string,
    title: string,
    dueDate: string,
    phase: TaskPhase
  ) => {
    const customTask = createCustomTask(title, dueDate, phase);
    setReleases((prev) =>
      prev.map((rel) =>
        rel.id === releaseId
          ? { ...rel, tasks: [...rel.tasks, customTask] }
          : rel
      )
    );
  };

  const handleDeleteRelease = (releaseId: string) => {
    setReleases((prev) => {
      const next = prev.filter((r) => r.id !== releaseId);
      if (selectedReleaseId === releaseId) {
        setSelectedReleaseId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const handleExportJson = () => {
    const json = exportReleasesJson(releases);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lxg-releases-backup-${todayIso}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice({
      type: 'success',
      message: `Exported ${releases.length} release(s).`,
    });
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseImportedReleasesJson(text);
      setReleases(imported);
      setSelectedReleaseId(imported[0]?.id ?? null);
      setBackupNotice({
        type: 'success',
        message: `Imported ${imported.length} release(s).`,
      });
    } catch (err) {
      setBackupNotice({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Failed to import JSON backup.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] text-white lg:flex-row">
      <ReleaseSidebar
        releases={releases}
        selectedReleaseId={selectedRelease?.id ?? null}
        todayIso={todayIso}
        backupNotice={backupNotice}
        onSelectRelease={setSelectedReleaseId}
        onOpenNewRelease={() => setIsNewModalOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {selectedRelease ? (
        <ReleaseWorkspace
          key={selectedRelease.id}
          release={selectedRelease}
          todayIso={todayIso}
          hideCompleted={hideCompleted}
          onToggleHideCompleted={() => setHideCompleted((v) => !v)}
          onCompleteTask={handleCompleteTask}
          onAddCustomTask={handleAddCustomTask}
          onDeleteRelease={handleDeleteRelease}
        />
      ) : (
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm rounded-lg border border-[#262626] bg-[#141414] p-6 text-center">
            <Disc3 className="mx-auto h-8 w-8 text-[#22C55E]" />
            <h1 className="mt-3 text-base font-bold tracking-wider uppercase">
              No Active Releases
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
              Log your next single or EP to generate a deterministic T-28 to
              Release Day checklist.
            </p>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded bg-[#22C55E] px-4 py-2 text-xs font-bold tracking-wider text-[#0A0A0A] uppercase transition-colors hover:bg-[#16A34A]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              New Release
            </button>
          </div>
        </main>
      )}

      <NewReleaseModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreate={handleCreateRelease}
      />
    </div>
  );
}

export default App;
