import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Currency {
  id: number;
  symbol: string | null;
  description: string | null;
  created_at: string;
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async (): Promise<Currency[]> => {
      const { data, error } = await supabase
        .from('currency_type')
        .select('*')
        .order('description');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
