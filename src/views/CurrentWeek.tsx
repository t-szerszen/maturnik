import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { addWeeks, subWeeks, getISOWeek, getISOWeekYear } from 'date-fns';
import { useStore } from '../store';
import { getWeekData, formatDatePl } from '../utils/date';
import SessionCard from '../components/SessionCard';

export default function CurrentWeek() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { weekNumber, year, days, start, end } = getWeekData(currentDate);
  
  const generateWeekFromTemplate = useStore(s => s.generateWeekFromTemplate);
  const sessions = useStore(s => s.sessions);
  const subjects = useStore(s => s.subjects);

  useEffect(() => {
    generateWeekFromTemplate(weekNumber, year, days);
  }, [weekNumber, year, generateWeekFromTemplate, days]);

  const nextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const prevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    const realWeek = getISOWeek(new Date());
    const realYear = getISOWeekYear(new Date());
    const newWeek = getISOWeek(newDate);
    const newYear = getISOWeekYear(newDate);
    
    if (newYear < realYear || (newYear === realYear && newWeek < realWeek)) return;
    setCurrentDate(newDate);
  };
  const currentWeek = () => setCurrentDate(new Date());

  const realCurrentWeek = getISOWeek(new Date());
  const realCurrentYear = getISOWeekYear(new Date());
  const canGoBack = year > realCurrentYear || (year === realCurrentYear && weekNumber > realCurrentWeek);

  const weekSessions = sessions.filter(s => s.weekNumber === weekNumber && s.year === year);
  
  // Calculate buffer: skipped sessions in this week
  const skippedSessions = weekSessions.filter(s => s.status === 'skipped');
  const bufferHours = skippedSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} disabled={!canGoBack} className={`p-2 rounded-lg ${canGoBack ? 'hover:bg-zinc-800' : 'opacity-30 cursor-not-allowed'}`}><ChevronLeft size={20} /></button>
          <div className="text-center min-w-[140px]">
            <h2 className="font-semibold">Tydzień {weekNumber}</h2>
            <p className="text-xs text-zinc-400">{formatDatePl(start, 'dd.MM')} - {formatDatePl(end, 'dd.MM.yyyy')}</p>
          </div>
          <button onClick={nextWeek} className="p-2 hover:bg-zinc-800 rounded-lg"><ChevronRight size={20} /></button>
          <button onClick={currentWeek} className="ml-2 px-3 py-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">Bieżący</button>
        </div>

        {bufferHours > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <AlertCircle size={18} />
            <span className="font-medium text-sm">Dług: {bufferHours.toFixed(1)}h do odrobienia</span>
          </div>
        )}
      </div>

      {/* Days List */}
      <div className="space-y-6">
        {days.map((day) => {
          const dayDateStr = day.toISOString().split('T')[0];
          const daySessions = weekSessions.filter(s => s.date === dayDateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
          const dayName = formatDatePl(day, 'EEEE');
          
          return (
            <div key={dayDateStr} className="bg-zinc-900/50 rounded-2xl p-4 md:p-6 border border-zinc-800/60 shadow-sm">
              <h3 className="font-semibold text-lg capitalize mb-4 text-zinc-200">
                {dayName} <span className="text-sm font-normal text-zinc-500 ml-2">{formatDatePl(day, 'dd.MM')}</span>
              </h3>
              
              {daySessions.length === 0 ? (
                <p className="text-sm text-zinc-500 italic px-2">Brak zaplanowanych sesji na ten dzień.</p>
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
