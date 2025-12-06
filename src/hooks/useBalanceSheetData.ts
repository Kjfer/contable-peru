import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
  category: string;
}

interface BalanceSheetResult {
  assetAccounts: AccountBalance[];
  liabilityAccounts: AccountBalance[];
  equityAccounts: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  loading: boolean;
}

export function useBalanceSheetData(businessId: string, period: string): BalanceSheetResult {
  const [assetAccounts, setAssetAccounts] = useState<AccountBalance[]>([]);
  const [liabilityAccounts, setLiabilityAccounts] = useState<AccountBalance[]>([]);
  const [equityAccounts, setEquityAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalanceSheet();
  }, [businessId, period]);

  const loadBalanceSheet = async () => {
    setLoading(true);
    try {
      const { endDate } = getDateRangeFromPeriod(period);

      const { data: accounts } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .in('account_type', ['asset', 'liability', 'equity'])
        .order('code');

      if (!accounts) {
        setAssetAccounts([]);
        setLiabilityAccounts([]);
        setEquityAccounts([]);
        return;
      }

      let entriesQuery = supabase
        .from('accounting_entries')
        .select('id')
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

      const assets = accounts
        .filter(a => a.account_type === 'asset')
        .map(a => ({
          code: a.code,
          name: a.name,
          balance: balances[a.code] || 0,
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      const liabilities = accounts
        .filter(a => a.account_type === 'liability')
        .map(a => ({
          code: a.code,
          name: a.name,
          balance: -(balances[a.code] || 0),
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      const equity = accounts
        .filter(a => a.account_type === 'equity')
        .map(a => ({
          code: a.code,
          name: a.name,
          balance: -(balances[a.code] || 0),
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      setAssetAccounts(assets);
      setLiabilityAccounts(liabilities);
      setEquityAccounts(equity);
    } catch (error) {
      console.error('Error loading balance sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return {
    assetAccounts,
    liabilityAccounts,
    equityAccounts,
    totalAssets,
    totalLiabilities,
    totalEquity,
    loading,
  };
}
