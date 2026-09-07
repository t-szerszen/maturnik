export interface Subject {
  id: string;
  name: string;
  color: string;
  weeklyGoalMinutes?: number;
}

export type SessionType = 'sesja' | 'korepetycje';
export type SessionStatus = 'completed' | 'skipped' | 'pending';

export interface TemplateSession {
  id: string;
  dayOfWeek: number; // 1=Poniedziałek ... 7=Niedziela
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  durationMinutes: number;
  subjectId: string;
  type: SessionType;
}

export interface ActualSession {
  id: string;
  date: string; // "YYYY-MM-DD"
  weekNumber: number;
  year: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subjectId: string;
  type: SessionType;
  status: SessionStatus;
  notes: string;
}
