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
    return true;
  });

  const completed = filteredSessions.filter(s => s.status === 'completed');
  const skipped = filteredSessions.filter(s => s.status === 'skipped');
  const pending = filteredSessions.filter(s => s.status === 'pending');

  const totalMinutesPlanned = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalMinutesCompleted = completed.reduce((acc, s) => acc + s.durationMinutes, 0);
  
  const progressPercent = totalMinutesPlanned > 0 ? Math.round((totalMinutesCompleted / totalMinutesPlanned) * 100) : 0;

  const subjectStats = subjects.map(sub => {
    const subSessions = completed.filter(s => s.subjectId === sub.id);
    const mins = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return { ...sub, minutes: mins };
  }).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Statystyki</h2>
        <div className="flex bg-slate-900 rounded-lg p-1">
          <button 
            onClick={() => setRange('week')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ten tydzień
          </button>
          <button 
            onClick={() => setRange('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${range === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Wszystko
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-indigo-400" />
            <h3 className="font-semibold text-slate-300">Czas nauki</h3>
          </div>
          <p className="text-3xl font-bold text-white">{(totalMinutesCompleted / 60).toFixed(1)} <span className="text-lg text-slate-400 font-normal">godzin</span></p>
          <p className="text-sm text-slate-500 mt-1">Zaplanowano: {(totalMinutesPlanned / 60).toFixed(1)} h</p>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-emerald-400" />
            <h3 className="font-semibold text-slate-300">Realizacja</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-white">{progressPercent}%</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-400" />
            <h3 className="font-semibold text-slate-300">Pominięte</h3>
          </div>
          <p className="text-3xl font-bold text-white">{skipped.length} <span className="text-lg text-slate-400 font-normal">sesji</span></p>
          <p className="text-sm text-slate-500 mt-1">Oczekuje: {pending.length}</p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <h3 className="font-semibold text-lg mb-6">Czas per przedmiot</h3>
        {subjectStats.length === 0 ? (
          <p className="text-slate-500 italic text-sm">Brak zrealizowanych sesji w wybranym okresie.</p>
        ) : (
          <div className="space-y-4">
            {subjectStats.map(sub => {
              const maxMinutes = subjectStats[0].minutes;
              const width = Math.max(5, (sub.minutes / maxMinutes) * 100);
              return (
                <div key={sub.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{sub.name}</span>
                    <span className="text-slate-400">{(sub.minutes / 60).toFixed(1)} h</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${width}%`, backgroundColor: sub.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
