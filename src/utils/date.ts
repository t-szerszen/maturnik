import { startOfWeek, endOfWeek, addWeeks, subWeeks, getISOWeek, getISOWeekYear, eachDayOfInterval, format } from 'date-fns';
import { pl } from 'date-fns/locale';

export const getWeekData = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(date);
  const year = getISOWeekYear(date);
  
  const days = eachDayOfInterval({ start, end });
  
  return { start, end, weekNumber, year, days };
};

export const formatDatePl = (date: Date, fmt: string) => format(date, fmt, { locale: pl });
