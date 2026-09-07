import { useState } from 'react';
import { useStore } from '../store';
import { History as HistoryIcon, Search } from 'lucide-react';
import SessionCard from '../components/SessionCard';

export default function History() {
  const { sessions, subjects } = useStore();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'skipped');
  
  const filtered = pastSessions.filter(s => {
    if (filterSubject !== 'all' && s.subjectId !== filterSubject) return false;
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.startTime.localeCompare(a.startTime);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <HistoryIcon className="text-emerald-400" size={28} />
          <h2 className="text-2xl font-bold">Historia sesji</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 w-full md:w-auto">
          <Search size={18} className="text-zinc-500" />
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 focus:outline-none w-full md:w-48"
          >
            <option value="all">Wszystkie przedmioty</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 text-center">
          <p className="text-zinc-500">Brak zrealizowanych sesji pasujących do kryteriów.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6">
          {filtered.map(session => {
            const subject = subjects.find(s => s.id === session.subjectId);
            if (!subject) return null;
            return (
              <div key={session.id} className="relative pt-3">
                <div className="absolute left-3 top-0 bg-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 text-zinc-300 border border-zinc-700 shadow-sm uppercase tracking-wider">
                  {session.date}
                </div>
                <SessionCard session={session} subject={subject} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
