import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, TemplateSession, ActualSession } from '../types';

export const defaultSubjects: Subject[] = [
  { id: 'math', name: 'Matematyka rozszerzona', color: '#3B82F6' },
  { id: 'inf-mobile', name: 'INF.04: Mobile (Kotlin)', color: '#10B981' },
  { id: 'inf-console', name: 'INF.04: Konsola (Python)', color: '#F59E0B' },
  { id: 'inf-desktop', name: 'INF.04: Desktop (Qt)', color: '#8B5CF6' },
  { id: 'inf-web', name: 'INF.04: Web (React)', color: '#06B6D4' },
  { id: 'matura-inf', name: 'Informatyka maturalna', color: '#EC4899' },
  { id: 'pol', name: 'Język polski', color: '#EF4444' },
  { id: 'ang', name: 'Język angielski', color: '#6366F1' },
  { id: 'flex', name: 'Sesja elastyczna / buforowa', color: '#64748b' },
];

export const defaultTemplate: TemplateSession[] = [
  { id: 't1', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', durationMinutes: 120, subjectId: 'math', type: 'sesja' },
  { id: 't2', dayOfWeek: 1, startTime: '17:00', endTime: '19:00', durationMinutes: 120, subjectId: 'inf-mobile', type: 'sesja' },
  { id: 't3', dayOfWeek: 2, startTime: '08:30', endTime: '10:30', durationMinutes: 120, subjectId: 'inf-console', type: 'sesja' },
  { id: 't4', dayOfWeek: 2, startTime: '16:30', endTime: '18:00', durationMinutes: 90, subjectId: 'inf-desktop', type: 'sesja' },
  { id: 't5', dayOfWeek: 2, startTime: '18:30', endTime: '19:30', durationMinutes: 60, subjectId: 'pol', type: 'sesja' },
  { id: 't6', dayOfWeek: 3, startTime: '19:15', endTime: '20:00', durationMinutes: 45, subjectId: 'ang', type: 'sesja' },
  { id: 't7', dayOfWeek: 4, startTime: '14:30', endTime: '16:30', durationMinutes: 120, subjectId: 'inf-web', type: 'sesja' },
  { id: 't8', dayOfWeek: 4, startTime: '17:30', endTime: '19:30', durationMinutes: 120, subjectId: 'matura-inf', type: 'sesja' },
  { id: 't9', dayOfWeek: 5, startTime: '08:30', endTime: '10:30', durationMinutes: 120, subjectId: 'math', type: 'sesja' },
  { id: 't10', dayOfWeek: 5, startTime: '11:00', endTime: '12:30', durationMinutes: 90, subjectId: 'inf-mobile', type: 'sesja' },
  { id: 't11', dayOfWeek: 5, startTime: '18:45', endTime: '20:00', durationMinutes: 75, subjectId: 'pol', type: 'sesja' },
  { id: 't12', dayOfWeek: 6, startTime: '09:30', endTime: '11:30', durationMinutes: 120, subjectId: 'flex', type: 'sesja' },
  { id: 't13', dayOfWeek: 7, startTime: '13:00', endTime: '14:30', durationMinutes: 90, subjectId: 'math', type: 'korepetycje' },
];

interface AppState {
  subjects: Subject[];
  template: TemplateSession[];
  sessions: ActualSession[];
  
  addSession: (session: ActualSession) => void;
  updateSession: (id: string, data: Partial<ActualSession>) => void;
  deleteSession: (id: string) => void;
  generateWeekFromTemplate: (weekNumber: number, year: number, dates: Date[]) => void;
  
  updateTemplate: (template: TemplateSession[]) => void;
  updateSubjects: (subjects: Subject[]) => void;
  
  applyTemplateToCurrentWeek: (weekNumber: number, year: number, dates: Date[]) => void;

  importData: (data: string) => void;
  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      subjects: defaultSubjects,
      template: defaultTemplate,
      sessions: [],

      addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
      updateSession: (id, data) => set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, ...data } : s)
      })),
      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id)
      })),
      
      generateWeekFromTemplate: (weekNumber, year, dates) => {
        const { sessions, template } = get();
        const weekExists = sessions.some(s => s.weekNumber === weekNumber && s.year === year && s.id.startsWith('tmpl-'));
        if (weekExists) return;

        const newSessions: ActualSession[] = template.map(tmpl => {
          const dateStr = dates[tmpl.dayOfWeek - 1].toISOString().split('T')[0];
          return {
            id: `tmpl-${year}-${weekNumber}-${tmpl.id}`,
            date: dateStr,
            weekNumber,
            year,
            startTime: tmpl.startTime,
            endTime: tmpl.endTime,
            durationMinutes: tmpl.durationMinutes,
            subjectId: tmpl.subjectId,
            type: tmpl.type,
            status: 'pending',
            notes: ''
          };
        });

        set({ sessions: [...sessions, ...newSessions] });
      },

      updateTemplate: (template) => set({ template }),
      updateSubjects: (subjects) => set({ subjects }),

      applyTemplateToCurrentWeek: (weekNumber, year, dates) => {
        const { sessions, template } = get();
        
        const retainedSessions = sessions.filter(s => {
          if (s.weekNumber === weekNumber && s.year === year && s.id.startsWith('tmpl-')) {
            return s.status !== 'pending';
          }
          return true;
        });

        const newSessions: ActualSession[] = template.map(tmpl => {
          const dateStr = dates[tmpl.dayOfWeek - 1].toISOString().split('T')[0];
          return {
            id: `tmpl-${year}-${weekNumber}-${tmpl.id}-${Date.now()}`,
            date: dateStr,
            weekNumber,
            year,
            startTime: tmpl.startTime,
            endTime: tmpl.endTime,
            durationMinutes: tmpl.durationMinutes,
            subjectId: tmpl.subjectId,
            type: tmpl.type,
            status: 'pending',
            notes: ''
          };
        });

        set({ sessions: [...retainedSessions, ...newSessions] });
      },

      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed.subjects && parsed.template && parsed.sessions) {
            set({
              subjects: parsed.subjects,
              template: parsed.template,
              sessions: parsed.sessions
            });
          }
        } catch (e) {
          console.error("Failed to parse import data", e);
        }
      },
      
      resetData: () => set({
        subjects: defaultSubjects,
        template: defaultTemplate,
        sessions: []
      })
    }),
    {
      name: 'maturnik-storage',
    }
  )
);
