import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
  category: string;
}

interface IncomeStatementResult {
  incomeAccounts: AccountBalance[];
  expenseAccounts: AccountBalance[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  loading: boolean;
}

export function useIncomeStatementData(businessId: string, period: string): IncomeStatementResult {
  const [incomeAccounts, setIncomeAccounts] = useState<AccountBalance[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncomeStatement();
  }, [businessId, period]);

  const loadIncomeStatement = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);

      const { data: accounts } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .in('account_type', ['income', 'expense'])
        .order('code');

      if (!accounts) {
        setIncomeAccounts([]);
        setExpenseAccounts([]);
        return;
      }

      let entriesQuery = supabase
        .from('accounting_entries')
        .select('id')
        .gte('date', startDate)
        .lte('date', endDate);

      if (businessId && businessId !== 'all') {
        entriesQuery = entriesQuery.eq('business_id', businessId);
      }

      const { data: entries } = await entriesQuery;
      const entryIds = entries?.map(e => e.id) || [];

      let balances: Record<string, number> = {};
      
      if (entryIds.length > 0) {
        const { data: lines } = await supabase
          .from('accounting_entry_lines')
          .select('account_code, debit, credit')
          .in('entry_id', entryIds);

        if (lines) {
          lines.forEach(line => {
            const debit = Number(line.debit) || 0;
            const credit = Number(line.credit) || 0;
            if (!balances[line.account_code]) {
              balances[line.account_code] = 0;
            }
            balances[line.account_code] += debit - credit;
          });
        }
      }

      const income = accounts
        .filter(a => a.account_type === 'income')
        .map(a => ({
          code: a.code,
          name: a.name,
          balance: -(balances[a.code] || 0),
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      const expenses = accounts
        .filter(a => a.account_type === 'expense')
        .map(a => ({
          code: a.code,
          name: a.name,
          balance: balances[a.code] || 0,
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      setIncomeAccounts(income);
      setExpenseAccounts(expenses);
    } catch (error) {
      console.error('Error loading income statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const netIncome = totalIncome - totalExpenses;

  return {
    incomeAccounts,
    expenseAccounts,
    totalIncome,
    totalExpenses,
    netIncome,
    loading,
  };
}
