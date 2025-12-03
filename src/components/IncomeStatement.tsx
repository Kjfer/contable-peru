import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IncomeStatementProps {
  businessId: string;
  period: string;
}

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
  category: string;
}

export function IncomeStatement({ businessId, period }: IncomeStatementProps) {
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

      // Get all income and expense accounts
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

      // Get all accounting entries within period
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

      // Get account balances from entry lines
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
            // For income: credit increases (positive), debit decreases
            // For expense: debit increases (positive), credit decreases
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
          // Income accounts have credit balance, so we negate to show positive
          balance: -(balances[a.code] || 0),
          category: a.category,
        }))
        .filter(a => a.balance !== 0);

      const expenses = accounts
        .filter(a => a.account_type === 'expense')
        .map(a => ({
          code: a.code,
          name: a.name,
          // Expense accounts have debit balance (positive)
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

  if (loading) {
    return <Card className="p-6"><p className="text-muted-foreground">Cargando...</p></Card>;
  }

  // Group by category
  const groupedIncome = incomeAccounts.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AccountBalance[]>);

  const groupedExpenses = expenseAccounts.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AccountBalance[]>);

  const periodLabel = period === 'current-month' ? 'Mes Actual' : 
                      period === 'last-month' ? 'Mes Anterior' :
                      period === 'current-year' ? 'Año Actual' : period;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">ESTADO DE RESULTADOS</h3>
          <p className="text-sm text-muted-foreground mb-6">Período: {periodLabel}</p>
        </div>

        {/* INGRESOS */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-foreground border-b pb-2">INGRESOS</h4>
          {Object.keys(groupedIncome).length === 0 ? (
            <p className="text-sm text-muted-foreground pl-4">Sin ingresos registrados</p>
          ) : (
            Object.entries(groupedIncome).map(([category, accounts]) => (
              <div key={category} className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">{category}</p>
                {accounts.map(account => (
                  <div key={account.code} className="flex justify-between pl-4 text-sm">
                    <span>{account.code} - {account.name}</span>
                    <span className="financial-number font-medium">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              </div>
            ))
          )}
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total Ingresos</span>
            <span className="financial-number text-success">{formatCurrency(totalIncome)}</span>
          </div>
        </div>

        {/* EGRESOS */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-foreground border-b pb-2">EGRESOS</h4>
          {Object.keys(groupedExpenses).length === 0 ? (
            <p className="text-sm text-muted-foreground pl-4">Sin egresos registrados</p>
          ) : (
            Object.entries(groupedExpenses).map(([category, accounts]) => (
              <div key={category} className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">{category}</p>
                {accounts.map(account => (
                  <div key={account.code} className="flex justify-between pl-4 text-sm">
                    <span>{account.code} - {account.name}</span>
                    <span className="financial-number font-medium">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              </div>
            ))
          )}
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total Egresos</span>
            <span className="financial-number text-destructive">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* RESULTADO NETO */}
        <div className="border-t-2 border-primary pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>RESULTADO NETO DEL PERÍODO</span>
            <span className={`financial-number ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netIncome)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
