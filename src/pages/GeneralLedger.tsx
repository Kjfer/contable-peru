import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { useGeneralLedger, useChartOfAccounts } from '@/hooks/useGeneralLedger';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function GeneralLedger() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedAccount, setSelectedAccount] = useState('all');

  const { data: accounts, isLoading, error } = useGeneralLedger({
    businessId: selectedBusiness,
    period: selectedPeriod,
    accountCode: selectedAccount,
  });

  const { data: chartOfAccounts } = useChartOfAccounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Libro Mayor</h1>
          <p className="mt-1 text-muted-foreground">Movimientos detallados por cuenta contable</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las cuentas</SelectItem>
            {(chartOfAccounts || []).map((account) => (
              <SelectItem key={account.code} value={account.code}>
                {account.code} - {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Error al cargar el libro mayor
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No hay movimientos para el período seleccionado</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {accounts.map((account) => (
            <Card key={account.code} className="overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  {account.code} - {account.name}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Fecha</TableHead>
                      <TableHead className="w-[150px]">Asiento</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right w-[130px]">Debe</TableHead>
                      <TableHead className="text-right w-[130px]">Haber</TableHead>
                      <TableHead className="text-right w-[130px]">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.entries.map((entry, idx) => (
                      <TableRow key={`${entry.entryId}-${idx}`}>
                        <TableCell>
                          {format(new Date(entry.date), 'dd/MM/yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {entry.entryId.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${entry.balance < 0 ? 'text-destructive' : ''}`}>
                          {formatCurrency(Math.abs(entry.balance))}
                          {entry.balance < 0 ? ' (C)' : ' (D)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-semibold">
                        Totales del período
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(account.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(account.totalCredit)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${account.finalBalance < 0 ? 'text-destructive' : ''}`}>
                        {formatCurrency(Math.abs(account.finalBalance))}
                        {account.finalBalance < 0 ? ' (C)' : ' (D)'}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
