import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BalanceSheetProps {
  businessId: string;
  period: string;
}

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
  category: string;
}

export function BalanceSheet({ businessId, period }: BalanceSheetProps) {
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
      // TODO: Implementar cálculo real de balances por cuenta
      // Por ahora mostramos la estructura con valores de ejemplo
      const { data: accounts } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .in('account_type', ['asset', 'liability', 'equity'])
        .order('code');

      const assets = accounts?.filter(a => a.account_type === 'asset').map(a => ({
        code: a.code,
        name: a.name,
        balance: 0,
        category: a.category,
      })) || [];

      const liabilities = accounts?.filter(a => a.account_type === 'liability').map(a => ({
        code: a.code,
        name: a.name,
        balance: 0,
        category: a.category,
      })) || [];

      const equity = accounts?.filter(a => a.account_type === 'equity').map(a => ({
        code: a.code,
        name: a.name,
        balance: 0,
        category: a.category,
      })) || [];

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
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  if (loading) {
    return <Card className="p-6"><p className="text-muted-foreground">Cargando...</p></Card>;
  }

  // Group by category
  const groupedAssets = assetAccounts.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AccountBalance[]>);

  const groupedLiabilities = liabilityAccounts.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AccountBalance[]>);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">BALANCE GENERAL</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Período: {period === 'current-month' ? 'Mes Actual' : period}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* ACTIVOS */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-foreground border-b pb-2">ACTIVOS</h4>
            {Object.entries(groupedAssets).map(([category, accounts]) => (
              <div key={category} className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">{category}</p>
                {accounts.map(account => (
                  <div key={account.code} className="flex justify-between pl-4 text-sm">
                    <span className="text-xs">{account.code} - {account.name}</span>
                    <span className="financial-number font-medium">{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between font-bold border-t-2 border-primary pt-2">
              <span>TOTAL ACTIVOS</span>
              <span className="financial-number">{formatCurrency(totalAssets)}</span>
            </div>
          </div>

          {/* PASIVOS Y PATRIMONIO */}
          <div className="space-y-6">
            {/* PASIVOS */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground border-b pb-2">PASIVOS</h4>
              {Object.entries(groupedLiabilities).map(([category, accounts]) => (
                <div key={category} className="space-y-2">
                  <p className="font-medium text-sm text-muted-foreground">{category}</p>
                  {accounts.map(account => (
                    <div key={account.code} className="flex justify-between pl-4 text-sm">
                      <span className="text-xs">{account.code} - {account.name}</span>
                      <span className="financial-number font-medium">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Pasivos</span>
                <span className="financial-number">{formatCurrency(totalLiabilities)}</span>
              </div>
            </div>

            {/* PATRIMONIO */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-foreground border-b pb-2">PATRIMONIO</h4>
              {equityAccounts.map(account => (
                <div key={account.code} className="flex justify-between pl-4 text-sm">
                  <span className="text-xs">{account.code} - {account.name}</span>
                  <span className="financial-number font-medium">{formatCurrency(account.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Patrimonio</span>
                <span className="financial-number">{formatCurrency(totalEquity)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold border-t-2 border-primary pt-2">
              <span>TOTAL PASIVOS + PATRIMONIO</span>
              <span className="financial-number">{formatCurrency(totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>

        {/* Ecuación contable */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <p className="text-sm text-center text-muted-foreground">
            Ecuación Contable: Activos = Pasivos + Patrimonio
          </p>
          <p className={`text-center font-semibold mt-2 ${
            Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? 'text-success' : 'text-destructive'
          }`}>
            {formatCurrency(totalAssets)} = {formatCurrency(totalLiabilitiesAndEquity)}
            {Math.abs(totalAssets - totalLiabilitiesAndEquity) >= 0.01 && ' (Desbalanceado)'}
          </p>
        </div>
      </div>
    </Card>
  );
}