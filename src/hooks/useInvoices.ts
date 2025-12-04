import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPeriodDates } from '@/lib/periodUtils';

interface UseInvoicesOptions {
  businessId?: string;
  period?: string;
  type?: 'sale' | 'purchase';
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  return useQuery({
    queryKey: ['invoices', options],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      if (options.businessId && options.businessId !== 'all') {
        query = query.eq('business_id', options.businessId);
      }

      if (options.type) {
        query = query.eq('type', options.type);
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
