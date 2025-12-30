import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPeriodDates } from '@/lib/periodUtils';

interface UseGeneralLedgerOptions {
  businessId?: string;
  period?: string;
  accountCode?: string;
}

export interface LedgerEntry {
  date: string;
  entryId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AccountLedger {
  code: string;
  name: string;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
}

export function useGeneralLedger(options: UseGeneralLedgerOptions = {}) {
  return useQuery({
    queryKey: ['general_ledger', options],
    queryFn: async () => {
      // First get all accounts that have movements
      let query = supabase
        .from('accounting_entry_lines')
        .select(`
          id,
          account_code,
          account_name,
          debit,
          credit,
          entry_id,
          created_at,
          entry:accounting_entries(id, date, description, business_id)
        `)
        .order('account_code');

      const { data: lines, error } = await query;
      if (error) throw error;
      if (!lines || lines.length === 0) return [];

      // Filter by business and period
      let filteredLines = lines.filter(line => {
        const entry = (line as any).entry;
        if (!entry) return false;
        
        if (options.businessId && options.businessId !== 'all') {
          if (entry.business_id !== options.businessId) return false;
        }
        
        if (options.period && options.period !== 'all') {
          const { startDate, endDate } = getPeriodDates(options.period);
          if (startDate && entry.date < startDate) return false;
          if (endDate && entry.date > endDate) return false;
        }
        
        return true;
      });

      // Filter by account if specified
      if (options.accountCode && options.accountCode !== 'all') {
        filteredLines = filteredLines.filter(line => line.account_code === options.accountCode);
      }

      // Group by account
      const accountsMap = new Map<string, AccountLedger>();

      filteredLines.forEach(line => {
        const entry = (line as any).entry;
        if (!accountsMap.has(line.account_code)) {
          accountsMap.set(line.account_code, {
            code: line.account_code,
            name: line.account_name,
            entries: [],
            totalDebit: 0,
            totalCredit: 0,
            finalBalance: 0,
          });
        }

        const account = accountsMap.get(line.account_code)!;
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;

        account.entries.push({
          date: entry.date,
          entryId: entry.id,
          description: entry.description,
          debit,
          credit,
          balance: 0, // Will calculate after sorting
        });

        account.totalDebit += debit;
        account.totalCredit += credit;
      });

      // Sort entries by date and calculate running balance
      const accounts = Array.from(accountsMap.values());
      accounts.forEach(account => {
        account.entries.sort((a, b) => a.date.localeCompare(b.date));
        
        let runningBalance = 0;
        account.entries.forEach(entry => {
          runningBalance += entry.debit - entry.credit;
          entry.balance = runningBalance;
        });
        
        account.finalBalance = account.totalDebit - account.totalCredit;
      });

      return accounts.sort((a, b) => a.code.localeCompare(b.code));
    },
  });
}

export function useChartOfAccounts() {
  return useQuery({
    queryKey: ['chart_of_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('code, name')
        .order('code');
      
      if (error) throw error;
      return data;
    },
  });
}
