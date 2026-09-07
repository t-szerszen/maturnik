import { useState } from 'react';
import { useStore } from '../store';
import { getWeekData } from '../utils/date';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function Statistics() {
  const [range, setRange] = useState<'week' | 'all'>('week');
  const sessions = useStore(s => s.sessions);
  const subjects = useStore(s => s.subjects);
  
  const { weekNumber, year } = getWeekData(new Date());

  const filteredSessions = sessions.filter(s => {
    if (range === 'week') return s.weekNumber === weekNumber && s.year === year;
    if (range === 'all') return s.year < year || (s.year === year && s.weekNumber <= weekNumber);
    return true;
  });

  const completed = filteredSessions.filter(s => s.status === 'completed');
  const skipped = filteredSessions.filter(s => s.status === 'skipped');
  const pending = filteredSessions.filter(s => s.status === 'pending');

  const totalMinutesPlanned = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalMinutesCompleted = completed.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalExtraMinutes = completed.filter(s => s.id.startsWith('adhoc-')).reduce((acc, s) => acc + s.durationMinutes, 0);
  
  const progressPercent = totalMinutesPlanned > 0 ? Math.round(((totalMinutesCompleted - totalExtraMinutes) / totalMinutesPlanned) * 100) : 0;

  const subjectStats = subjects.map(sub => {
    const subSessions = completed.filter(s => s.subjectId === sub.id);
    const mins = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const extraMins = subSessions.filter(s => s.id.startsWith('adhoc-')).reduce((acc, s) => acc + s.durationMinutes, 0);
    return { ...sub, minutes: mins, extraMinutes: extraMins };
  }).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  const weeklyStats = range === 'all' ? (() => {
    const grouped = new Map<string, { sessions: number, completedSessions: number, minutes: number, completedMinutes: number }>();
    filteredSessions.forEach(s => {
      const key = `${s.year}-W${s.weekNumber.toString().padStart(2, '0')}`;
      if (!grouped.has(key)) {
        grouped.set(key, { sessions: 0, completedSessions: 0, minutes: 0, completedMinutes: 0 });
      }
      const data = grouped.get(key)!;
      data.sessions += 1;
      data.minutes += s.durationMinutes;
      if (s.status === 'completed') {
        data.completedSessions += 1;
        data.completedMinutes += s.durationMinutes;
      }
    });
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  })() : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Statystyki</h2>
        <div className="flex bg-zinc-900 rounded-lg p-1">
          <button 
            onClick={() => setRange('week')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === 'week' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Ten tydzień
          </button>
          <button 
            onClick={() => setRange('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === 'all' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Wszystko
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-emerald-400" />
            <h3 className="font-semibold text-zinc-300">Czas nauki</h3>
          </div>
          <p className="text-3xl font-bold text-white">{(totalMinutesCompleted / 60).toFixed(1)} <span className="text-lg text-zinc-400 font-normal">godzin</span></p>
          <div className="text-sm text-zinc-500 mt-1 flex flex-col gap-1">
            <p>Z planu: {((totalMinutesCompleted - totalExtraMinutes) / 60).toFixed(1)} h / {(totalMinutesPlanned / 60).toFixed(1)} h</p>
            {totalExtraMinutes > 0 && <p className="text-amber-400/80">Dodatkowo: {(totalExtraMinutes / 60).toFixed(1)} h</p>}
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-emerald-400" />
            <h3 className="font-semibold text-zinc-300">Realizacja</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">{progressPercent}%</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-400" />
            <h3 className="font-semibold text-zinc-300">Pominięte</h3>
          </div>
          <p className="text-3xl font-bold text-white">{skipped.length} <span className="text-lg text-zinc-400 font-normal">sesji</span></p>
          <p className="text-sm text-zinc-500 mt-1">Oczekuje: {pending.length}</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-semibold text-lg mb-6">Czas per przedmiot</h3>
        {subjectStats.length === 0 ? (
          <p className="text-zinc-500 italic text-sm">Brak zrealizowanych sesji w wybranym okresie.</p>
        ) : (
          <div className="space-y-4">
            {subjectStats.map(sub => {
              const maxMinutes = subjectStats[0].minutes;
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-zinc-400 flex items-center gap-2">
                      {sub.extraMinutes > 0 && <span className="text-amber-400/80 text-xs">(+{ (sub.extraMinutes / 60).toFixed(1) }h)</span>}
                      {(sub.minutes / 60).toFixed(1)} h
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden flex">
                    <div className="h-3 transition-all" style={{ width: `${((sub.minutes - sub.extraMinutes) / maxMinutes) * 100}%`, backgroundColor: sub.color }} />
                    {sub.extraMinutes > 0 && (
                       <div className="h-3 transition-all bg-amber-400" style={{ width: `${(sub.extraMinutes / maxMinutes) * 100}%` }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {range === 'all' && weeklyStats.length > 0 && (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <h3 className="font-semibold text-lg mb-6">Realizacja tydzień po tygodniu</h3>
          <div className="space-y-4">
            {weeklyStats.map(([weekKey, stats]) => (
              <div key={weekKey} className="flex justify-between items-center border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                <span className="font-medium text-zinc-300">Tydzień {weekKey.split('-W')[1]} ({weekKey.split('-W')[0]})</span>
                <div className="text-right text-sm">
                  <p className="text-zinc-200">
                    <span className="text-emerald-400 font-medium">{stats.completedSessions}</span> / {stats.sessions} sesji
                  </p>
                  <p className="text-zinc-500">
                    {(stats.completedMinutes / 60).toFixed(1)} / {(stats.minutes / 60).toFixed(1)} h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
