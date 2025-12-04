import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPeriodDates } from '@/lib/periodUtils';

interface UseTransactionsOptions {
  businessId?: string;
  period?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  return useQuery({
    queryKey: ['transactions', options],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:transaction_categories(id, name, type)
        `)
        .order('date', { ascending: false });

      if (options.businessId && options.businessId !== 'all') {
        query = query.eq('business_id', options.businessId);
      }

      if (options.period && options.period !== 'all') {
        const { startDate, endDate } = getPeriodDates(options.period);
        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
