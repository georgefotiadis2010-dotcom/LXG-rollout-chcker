import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Calendar, Disc3, Plus, X } from 'lucide-react';
import type { ReleaseType } from '../types';
import { diffDaysIso, getTodayLocalIso } from '../utils/dateMath';

interface NewReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, releaseDate: string, releaseType: ReleaseType) => void;
}

export function NewReleaseModal({
  isOpen,
  onClose,
  onCreate,
}: NewReleaseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseType, setReleaseType] = useState<ReleaseType>('Single');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        titleInputRef.current?.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback light-dismiss for browsers without native `closedby="any"` (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    setTitle('');
    setReleaseDate('');
    setReleaseType('Single');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !releaseDate) return;
    onCreate(title.trim(), releaseDate, releaseType);
    handleClose();
  };

  const todayIso = getTodayLocalIso();
  const daysOut = releaseDate ? diffDaysIso(todayIso, releaseDate) : null;
  const isShortRunway = daysOut !== null && daysOut < 28;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="new-release-modal-title"
      {...({ closedby: 'any' } as Record<string, string>)}
      onClose={handleClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-[#262626] bg-[#141414] p-0 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-[#262626] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Disc3 className="h-4 w-4 text-[#22C55E]" />
          <h2
            id="new-release-modal-title"
            className="text-sm font-semibold tracking-wider uppercase"
          >
            Log New Release
          </h2>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close modal"
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-[#262626] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label
            htmlFor="release-title"
            className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-400 uppercase"
          >
            Song / Project Title
          </label>
          <input
            ref={titleInputRef}
            id="release-title"
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. NIGHTSHIFT"
            className="w-full rounded border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#22C55E] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="release-date"
              className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-400 uppercase"
            >
              Release Date
            </label>
            <div className="relative">
              <input
                id="release-date"
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full rounded border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium tracking-wider text-zinc-400 uppercase">
              Release Type
            </span>
            <div className="grid grid-cols-2 gap-1.5 rounded border border-[#262626] bg-[#0A0A0A] p-1">
              {(['Single', 'EP'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReleaseType(type)}
                  className={`rounded py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    releaseType === type
                      ? 'bg-[#22C55E] text-[#0A0A0A]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isShortRunway && (
          <div className="flex items-start gap-2.5 rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2.5 text-xs text-[#EF4444]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Release is {daysOut! < 0 ? 'in the past' : `${daysOut}d away`} (&lt;28d
              runway). Past-due generated milestones will be flagged as{' '}
              <strong className="font-semibold">
                Overdue / Immediate Action
              </strong>
              .
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#262626] pt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Generates 8 T-28 → T-0 tasks
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded border border-[#262626] bg-[#0A0A0A] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded bg-[#22C55E] px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#0A0A0A] uppercase transition-colors hover:bg-[#16A34A]"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Release
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
