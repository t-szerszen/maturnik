import { useState, useEffect } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { getWeekData, formatDatePl } from '../utils/date';
import SessionCard from '../components/SessionCard';
import { format } from 'date-fns';
import type { ActualSession } from '../types';

export default function CurrentWeek() {
  const { weekNumber, year, days, start, end } = getWeekData(new Date());
  
  const generateWeekFromTemplate = useStore(s => s.generateWeekFromTemplate);
  const sessions = useStore(s => s.sessions);
  const subjects = useStore(s => s.subjects);
  const addSession = useStore(s => s.addSession);

  const [showAddModal, setShowAddModal] = useState<string | null>(null); // holds date string if active
  const [newSessionData, setNewSessionData] = useState({
    subjectId: subjects[0]?.id || '',
    startTime: '16:00',
    endTime: '17:00',
    type: 'sesja' as const,
  });

  useEffect(() => {
    generateWeekFromTemplate(weekNumber, year, days);
  }, [weekNumber, year, generateWeekFromTemplate, days]);

  const weekSessions = sessions.filter(s => s.weekNumber === weekNumber && s.year === year);
  
  // Calculate Global Buffer/Debt
  const allSkippedMins = sessions.filter(s => s.status === 'skipped').reduce((acc, s) => acc + s.durationMinutes, 0);
  const allAdHocCompletedMins = sessions.filter(s => s.status === 'completed' && s.id.startsWith('adhoc-')).reduce((acc, s) => acc + s.durationMinutes, 0);
  
  const globalDebtHours = Math.max(0, (allSkippedMins - allAdHocCompletedMins) / 60);

  const handleAddAdHoc = (dateStr: string) => {
    const [sh, sm] = newSessionData.startTime.split(':').map(Number);
    const [eh, em] = newSessionData.endTime.split(':').map(Number);
    let durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMinutes < 0) durationMinutes += 24 * 60;

    const newSession: ActualSession = {
      id: `adhoc-${Date.now()}`,
      date: dateStr,
      weekNumber,
      year,
      startTime: newSessionData.startTime,
      endTime: newSessionData.endTime,
      durationMinutes,
      subjectId: newSessionData.subjectId,
      type: newSessionData.type,
      status: 'pending',
      notes: ''
    };

    addSession(newSession);
    setShowAddModal(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bieżący Tydzień ({weekNumber})</h2>
          <p className="text-sm text-zinc-400">{formatDatePl(start, 'dd.MM')} - {formatDatePl(end, 'dd.MM.yyyy')}</p>
        </div>

        {globalDebtHours > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <AlertCircle size={18} />
            <span className="font-medium text-sm">Zaległości: {globalDebtHours.toFixed(1)}h do odrobienia</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2Icon size={18} />
            <span className="font-medium text-sm">Brak zaległości. Dobra robota!</span>
          </div>
        )}
      </div>

      {/* Days List */}
      <div className="space-y-6">
        {days.map((day) => {
          const dayDateStr = format(day, 'yyyy-MM-dd');
          const daySessions = weekSessions.filter(s => s.date === dayDateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const dayName = formatDatePl(day, 'EEEE');
          const isToday = dayDateStr === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div key={dayDateStr} className={`bg-zinc-900/50 rounded-2xl p-4 md:p-6 border ${isToday ? 'border-emerald-500/30' : 'border-zinc-800/60'} shadow-sm relative`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg capitalize text-zinc-200">
                  {dayName} <span className="text-sm font-normal text-zinc-500 ml-2">{formatDatePl(day, 'dd.MM')}</span>
                  {isToday && <span className="ml-3 text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase tracking-wider">Dzisiaj</span>}
                </h3>
                <button 
                  onClick={() => setShowAddModal(dayDateStr)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition-colors"
                >
                  <Plus size={14} /> Dodaj sesję (Odrób dług)
                </button>
              </div>
              
              {showAddModal === dayDateStr && (
                <div className="mb-4 bg-zinc-950 p-4 rounded-xl border border-zinc-700 flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs text-zinc-400 block mb-1">Przedmiot</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      value={newSessionData.subjectId}
                      onChange={e => setNewSessionData({...newSessionData, subjectId: e.target.value})}
                    >
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Od</label>
                      <input 
                        type="time" 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={newSessionData.startTime}
                        onChange={e => setNewSessionData({...newSessionData, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Do</label>
                      <input 
                        type="time" 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={newSessionData.endTime}
                        onChange={e => setNewSessionData({...newSessionData, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => handleAddAdHoc(dayDateStr)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Zapisz
                    </button>
                    <button 
                      onClick={() => setShowAddModal(null)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {daySessions.length === 0 ? (
                <p className="text-sm text-zinc-500 italic px-2">Brak sesji na ten dzień.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daySessions.map(session => (
                    <SessionCard key={session.id} session={session} subject={subjects.find(s => s.id === session.subjectId)!} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

function CheckCircle2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
