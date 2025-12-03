import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import { useAccountingEntries } from '@/hooks/useAccountingEntries';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Loader2 } from 'lucide-react';
import { startOfMonth, endOfMonth, subMonths, startOfYear, format } from 'date-fns';

function getPeriodDates(period: string) {
  const now = new Date();
  switch (period) {
    case 'current-month':
      return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') };
    case 'last-month':
      const lastMonth = subMonths(now, 1);
      return { start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'), end: format(endOfMonth(lastMonth), 'yyyy-MM-dd') };
    case 'current-year':
      return { start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
    default:
      return { start: undefined, end: undefined };
  }
}

export default function AccountingEntries() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const { start, end } = useMemo(() => getPeriodDates(selectedPeriod), [selectedPeriod]);

  const { data: entries, isLoading, error } = useAccountingEntries({
    businessId: selectedBusiness,
    startDate: start,
    endDate: end,
  });

  const { data: businesses } = useBusinesses();

  const getBusinessName = (businessId: string) => {
    return businesses?.find(b => b.id === businessId)?.name || businessId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asientos Contables</h1>
          <p className="mt-1 text-muted-foreground">Registro de partida doble de todas las transacciones</p>
        </div>
      </div>

      <div className="flex gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="p-6">
          <p className="text-destructive">Error al cargar los asientos contables</p>
        </Card>
      )}

      {!isLoading && !error && entries?.length === 0 && (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No hay asientos contables para el período seleccionado</p>
        </Card>
      )}

      <div className="space-y-4">
        {entries?.map((entry) => {
          const totalDebit = entry.lines.reduce((sum, e) => sum + e.debit, 0);
          const totalCredit = entry.lines.reduce((sum, e) => sum + e.credit, 0);
          const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

          return (
            <Card key={entry.id} className="overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{entry.id.substring(0, 8)}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('es-PE')}
                      </span>
                      <Badge className="bg-primary/10 text-primary">
                        {getBusinessName(entry.business_id)}
                      </Badge>
                    </div>
                    <p className="mt-2 font-medium">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <Badge className="bg-success/10 text-success">Balanceado</Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive">Desbalanceado</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cuenta</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Debe</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Haber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entry.lines.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="px-6 py-3 text-sm">
                          {item.account_code} - {item.account_name}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {item.debit > 0 ? (
                            <span className="financial-number font-medium text-foreground">
                              {formatCurrency(item.debit)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {item.credit > 0 ? (
                            <span className="financial-number font-medium text-foreground">
                              {formatCurrency(item.credit)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-border bg-secondary/30">
                    <tr>
                      <td className="px-6 py-3 text-sm font-bold">TOTALES</td>
                      <td className="px-6 py-3 text-right">
                        <span className="financial-number text-sm font-bold">
                          {formatCurrency(totalDebit)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="financial-number text-sm font-bold">
                          {formatCurrency(totalCredit)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
