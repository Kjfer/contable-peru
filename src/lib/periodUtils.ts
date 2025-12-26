import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, startOfQuarter, endOfQuarter, format } from 'date-fns';

export function getDateRangeFromPeriod(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  
  // Check if it's a specific month format (YYYY-MM)
  if (period && period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return {
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    };
  }
  
  switch (period) {
    case 'current-month':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last-month':
      const lastMonth = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    case 'current-quarter':
      return {
        startDate: format(startOfQuarter(now), 'yyyy-MM-dd'),
        endDate: format(endOfQuarter(now), 'yyyy-MM-dd'),
      };
    case 'current-year':
      return {
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(endOfYear(now), 'yyyy-MM-dd'),
      };
    case 'last-year':
      const lastYear = subYears(now, 1);
      return {
        startDate: format(startOfYear(lastYear), 'yyyy-MM-dd'),
        endDate: format(endOfYear(lastYear), 'yyyy-MM-dd'),
      };
    case 'all':
      return { startDate: '', endDate: '' };
    default:
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
  }
}

export function getPeriodLabel(period: string): string {
  const now = new Date();
  
  // Check if it's a specific month format (YYYY-MM)
  if (period && period.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy');
  }
  
  switch (period) {
    case 'current-month':
      return format(now, 'MMMM yyyy');
    case 'last-month':
      return format(subMonths(now, 1), 'MMMM yyyy');
    case 'current-quarter':
      return `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
    case 'current-year':
      return `Año ${now.getFullYear()}`;
    case 'last-year':
      return `Año ${now.getFullYear() - 1}`;
    case 'all':
      return 'Todos los períodos';
    default:
      return format(now, 'MMMM yyyy');
  }
}

// Alias for backward compatibility
export const getPeriodDates = getDateRangeFromPeriod;
