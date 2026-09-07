import type { ActualSession, Subject } from '../types';
import { useStore } from '../store';
import { Check, X, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Props {
  session: ActualSession;
  subject: Subject;
}

export default function SessionCard({ session, subject }: Props) {
  const updateSession = useStore(s => s.updateSession);

  const toggleStatus = (status: ActualSession['status']) => {
    updateSession(session.id, { status: session.status === status ? 'pending' : status });
  };

  return (
    <div 
      className={twMerge(
        clsx(
          "flex flex-col gap-3 p-4 rounded-xl border transition-colors",
          session.status === 'completed' ? 'bg-emerald-950/20 border-emerald-900/30' :
          session.status === 'skipped' ? 'bg-red-950/20 border-red-900/30' :
          'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
        )
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color || '#ccc' }} />
          <span className="font-semibold text-sm">{subject?.name || 'Nieznany przedmiot'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {session.id.startsWith('adhoc-') && (
            <div className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
              Dodatkowa
            </div>
          )}
          <div className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium">
            {session.type === 'sesja' ? 'Sesja' : 'Korepetycje'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <Clock size={14} />
        <span>{session.startTime} - {session.endTime}</span>
        <span className="text-zinc-600">({session.durationMinutes} min)</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <button 
          onClick={() => toggleStatus('completed')}
          className={twMerge(
            clsx(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors border",
              session.status === 'completed' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-300'
            )
          )}
        >
          <Check size={16} /> Zrobione
        </button>
        <button 
          onClick={() => toggleStatus('skipped')}
          className={twMerge(
            clsx(
              "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium transition-colors border",
              session.status === 'skipped' 
                ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-300'
            )
          )}
        >
          <X size={16} /> Pominięte
        </button>
      </div>

      <div className="mt-2">
        <textarea 
          placeholder="Notatka / zrealizowany materiał..."
          value={session.notes || ''}
          onChange={(e) => updateSession(session.id, { notes: e.target.value })}
          rows={2}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-y min-h-[60px]"
        />
      </div>
    </div>
  );
}
