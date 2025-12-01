import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/calculations';
import { BookOpen } from 'lucide-react';

interface LedgerEntry {
  date: string;
  transactionId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AccountLedger {
  accountCode: string;
  accountName: string;
  entries: LedgerEntry[];
}

// Mock data para libro mayor
const MOCK_LEDGER: AccountLedger[] = [
  {
    accountCode: '1041',
    accountName: 'Cuentas por Cobrar',
    entries: [
      {
        date: '2025-11-01',
        transactionId: 'SALDO-INICIAL',
        description: 'Saldo inicial del período',
        debit: 10000,
        credit: 0,
        balance: 10000,
      },
      {
        date: '2025-11-15',
        transactionId: 'TRX-001',
        description: 'Venta de productos',
        debit: 5900,
        credit: 0,
        balance: 15900,
      },
      {
        date: '2025-11-20',
        transactionId: 'TRX-005',
        description: 'Cobro de factura',
        debit: 0,
        credit: 5900,
        balance: 10000,
      },
    ],
  },
  {
    accountCode: '7011',
    accountName: 'Ventas',
    entries: [
      {
        date: '2025-11-01',
        transactionId: 'SALDO-INICIAL',
        description: 'Saldo inicial del período',
        debit: 0,
        credit: 0,
        balance: 0,
      },
      {
        date: '2025-11-15',
        transactionId: 'TRX-001',
        description: 'Venta de productos',
        debit: 0,
        credit: 5000,
        balance: 5000,
      },
      {
        date: '2025-11-22',
        transactionId: 'TRX-008',
        description: 'Venta de servicios',
        debit: 0,
        credit: 3000,
        balance: 8000,
      },
    ],
  },
  {
    accountCode: '6011',
    accountName: 'Compras de Mercadería',
    entries: [
      {
        date: '2025-11-01',
        transactionId: 'SALDO-INICIAL',
        description: 'Saldo inicial del período',
        debit: 0,
        credit: 0,
        balance: 0,
      },
      {
        date: '2025-11-10',
        transactionId: 'TRX-003',
        description: 'Compra de mercadería',
        debit: 3000,
        credit: 0,
        balance: 3000,
      },
    ],
  },
  {
    accountCode: '4011',
    accountName: 'IGV por Pagar / Cobrar',
    entries: [
      {
        date: '2025-11-01',
        transactionId: 'SALDO-INICIAL',
        description: 'Saldo inicial del período',
        debit: 0,
        credit: 0,
        balance: 0,
      },
      {
        date: '2025-11-10',
        transactionId: 'TRX-003',
        description: 'IGV Compras',
        debit: 540,
        credit: 0,
        balance: 540,
      },
      {
        date: '2025-11-15',
        transactionId: 'TRX-001',
        description: 'IGV Ventas',
        debit: 0,
        credit: 900,
        balance: -360,
      },
    ],
  },
];

export default function GeneralLedger() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedAccount, setSelectedAccount] = useState(MOCK_LEDGER[0].accountCode);

  const currentAccount = MOCK_LEDGER.find(acc => acc.accountCode === selectedAccount) || MOCK_LEDGER[0];

  const totalDebit = currentAccount.entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = currentAccount.entries.reduce((sum, e) => sum + e.credit, 0);
  const finalBalance = currentAccount.entries[currentAccount.entries.length - 1]?.balance || 0;

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
            <BookOpen className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_LEDGER.map((account) => (
              <SelectItem key={account.accountCode} value={account.accountCode}>
                {account.accountCode} - {account.accountName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-primary/5 px-6 py-4">
          <h3 className="text-lg font-semibold">
            {currentAccount.accountCode} - {currentAccount.accountName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Transacción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Debe</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Haber</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentAccount.entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    {new Date(entry.date).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{entry.transactionId}</td>
                  <td className="px-6 py-4 text-sm">{entry.description}</td>
                  <td className="px-6 py-4 text-right">
                    {entry.debit > 0 ? (
                      <span className="financial-number font-medium">
                        {formatCurrency(entry.debit)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.credit > 0 ? (
                      <span className="financial-number font-medium">
                        {formatCurrency(entry.credit)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`financial-number font-semibold ${
                        entry.balance >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {formatCurrency(Math.abs(entry.balance))}
                      {entry.balance < 0 && ' CR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-secondary/50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-bold">
                  TOTALES DEL PERÍODO
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="financial-number text-sm font-bold">
                    {formatCurrency(totalDebit)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="financial-number text-sm font-bold">
                    {formatCurrency(totalCredit)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`financial-number text-sm font-bold ${
                      finalBalance >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(Math.abs(finalBalance))}
                    {finalBalance < 0 && ' CR'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
