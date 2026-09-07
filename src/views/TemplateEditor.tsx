import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2 } from 'lucide-react';
import type { Subject, TemplateSession, SessionType } from '../types';

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

export default function TemplateEditor() {
  const { subjects, template, updateSubjects, updateTemplate } = useStore();
  const [activeTab, setActiveTab] = useState<'subjects' | 'template'>('subjects');

  const addSubject = () => {
    const newId = `sub-${Date.now()}`;
    updateSubjects([...subjects, { id: newId, name: 'Nowy przedmiot', color: '#64748b' }]);
  };

  const deleteSubject = (id: string) => {
    updateSubjects(subjects.filter(s => s.id !== id));
    updateTemplate(template.filter(t => t.subjectId !== id)); // cascading delete from template
  };

  const handleSubjectChange = (id: string, field: keyof Subject, value: any) => {
    updateSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSlot = (dayOfWeek: number) => {
    const newSlot: TemplateSession = {
      id: `tmpl-slot-${Date.now()}`,
      dayOfWeek,
      startTime: '12:00',
      endTime: '13:00',
      durationMinutes: 60,
      subjectId: subjects[0]?.id || '',
      type: 'sesja'
    };
    updateTemplate([...template, newSlot]);
  };

  const updateSlot = (id: string, field: keyof TemplateSession, value: any) => {
    updateTemplate(template.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, [field]: value };
      
      // recalc duration if time changes
      if (field === 'startTime' || field === 'endTime') {
        const [sh, sm] = updated.startTime.split(':').map(Number);
        const [eh, em] = updated.endTime.split(':').map(Number);
        updated.durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
        if (updated.durationMinutes < 0) updated.durationMinutes += 24 * 60; // handle wrap around
      }
      return updated;
    }));
  };

  const deleteSlot = (id: string) => {
    updateTemplate(template.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Szablon i Przedmioty</h2>
        <div className="flex bg-zinc-900 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'subjects' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Przedmioty
          </button>
          <button 
            onClick={() => setActiveTab('template')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'template' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Szablon tygodnia
          </button>
        </div>
      </div>

      {activeTab === 'subjects' && (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Zarządzanie przedmiotami</h3>
            <button onClick={addSubject} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm transition-colors">
              <Plus size={16} /> Dodaj
            </button>
          </div>
          
          <div className="space-y-3">
            {subjects.map(sub => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <input 
                  type="color" 
                  value={sub.color} 
                  onChange={(e) => handleSubjectChange(sub.id, 'color', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />
                <input 
                  type="text" 
                  value={sub.name} 
                  onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="Nazwa przedmiotu"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={sub.weeklyGoalMinutes ? sub.weeklyGoalMinutes / 60 : ''}
                    onChange={(e) => handleSubjectChange(sub.id, 'weeklyGoalMinutes', e.target.value ? (parseFloat(e.target.value) * 60) : undefined as any)}
                    className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Cel"
                  />
                  <span className="text-zinc-500 text-sm">h/tyg</span>
                </div>
                <button 
                  onClick={() => deleteSubject(sub.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'template' && (
        <div className="space-y-6">
          {DAYS.map(day => {
            const daySlots = template.filter(t => t.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            return (
              <div key={day} className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">{DAY_NAMES[day-1]}</h3>
                  <button onClick={() => addSlot(day)} className="flex items-center gap-1 px-2 py-1 bg-zinc-800 text-zinc-300 hover:text-white rounded-md text-xs transition-colors">
                    <Plus size={14} /> Dodaj slot
                  </button>
                </div>
                
                <div className="space-y-3">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">Brak sesji w ten dzień.</p>
                  ) : (
                    daySlots.map(slot => (
                      <div key={slot.id} className="flex flex-col xl:flex-row xl:items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="flex gap-2 items-center shrink-0">
                          <input 
                            type="time" 
                            value={slot.startTime} 
                            onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none"
                          />
                          <span className="text-zinc-500">-</span>
                          <input 
                            type="time" 
                            value={slot.endTime} 
                            onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none"
                          />
                        </div>
                        
                        <select 
                          value={slot.subjectId}
                          onChange={(e) => updateSlot(slot.id, 'subjectId', e.target.value)}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none"
                        >
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        
                        <select 
                          value={slot.type}
                          onChange={(e) => updateSlot(slot.id, 'type', e.target.value as SessionType)}
                          className="w-32 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm focus:outline-none shrink-0"
                        >
                          <option value="sesja">Sesja</option>
                          <option value="korepetycje">Korepetycje</option>
                        </select>
                        
                        <button 
                          onClick={() => deleteSlot(slot.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
