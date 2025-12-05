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

// Alias for backward compatibility
export const getPeriodDates = getDateRangeFromPeriod;
