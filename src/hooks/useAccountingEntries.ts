import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountingEntryLine {
  id: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
}

export interface AccountingEntry {
  id: string;
  date: string;
  business_id: string;
  description: string;
  transaction_id: string | null;
  lines: AccountingEntryLine[];
}

interface UseAccountingEntriesOptions {
  businessId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAccountingEntries(options: UseAccountingEntriesOptions = {}) {
  return useQuery({
    queryKey: ['accounting_entries', options],
    queryFn: async () => {
      // First fetch entries
      let entriesQuery = supabase
        .from('accounting_entries')
        .select('*')
        .order('date', { ascending: false });

      if (options.businessId && options.businessId !== 'all') {
        entriesQuery = entriesQuery.eq('business_id', options.businessId);
      }

      if (options.startDate) {
        entriesQuery = entriesQuery.gte('date', options.startDate);
      }

      if (options.endDate) {
        entriesQuery = entriesQuery.lte('date', options.endDate);
      }

      const { data: entries, error: entriesError } = await entriesQuery;

      if (entriesError) throw entriesError;
      if (!entries || entries.length === 0) return [];

      // Then fetch all lines for these entries
      const entryIds = entries.map(e => e.id);
      const { data: lines, error: linesError } = await supabase
        .from('accounting_entry_lines')
        .select('*')
        .in('entry_id', entryIds);

      if (linesError) throw linesError;

      // Combine entries with their lines
      const entriesWithLines: AccountingEntry[] = entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        business_id: entry.business_id,
        description: entry.description,
        transaction_id: entry.transaction_id,
        lines: (lines || [])
          .filter(line => line.entry_id === entry.id)
          .map(line => ({
            id: line.id,
            account_code: line.account_code,
            account_name: line.account_name,
            debit: Number(line.debit) || 0,
            credit: Number(line.credit) || 0,
          })),
      }));

      return entriesWithLines;
    },
  });
}
