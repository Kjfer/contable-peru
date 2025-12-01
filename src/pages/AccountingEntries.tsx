import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import { BUSINESSES } from '@/lib/mockData';

interface AccountingEntry {
  id: string;
  date: string;
  transactionId: string;
  description: string;
  entries: {
    account: string;
    debit: number;
    credit: number;
  }[];
  businessId: string;
}

// Mock data para asientos contables
const MOCK_ENTRIES: AccountingEntry[] = [
  {
    id: '1',
    date: '2025-11-15',
    transactionId: 'TRX-001',
    description: 'Venta de productos con factura F001-00001',
    businessId: 'negocio1',
    entries: [
      { account: '1041 - Cuentas por Cobrar', debit: 5900, credit: 0 },
      { account: '7011 - Ventas', debit: 0, credit: 5000 },
      { account: '4011 - IGV por Pagar', debit: 0, credit: 900 },
    ],
  },
  {
    id: '2',
    date: '2025-11-16',
    transactionId: 'TRX-002',
    description: 'Pago de planilla mensual',
    businessId: 'negocio1',
    entries: [
      { account: '6211 - Sueldos y Salarios', debit: 3000, credit: 0 },
      { account: '1041 - Efectivo y Equivalentes', debit: 0, credit: 3000 },
    ],
  },
  {
    id: '3',
    date: '2025-11-10',
    transactionId: 'TRX-003',
    description: 'Compra de mercadería con factura F002-00050',
    businessId: 'negocio2',
    entries: [
      { account: '6011 - Compras de Mercadería', debit: 3000, credit: 0 },
      { account: '4011 - IGV por Cobrar', debit: 540, credit: 0 },
      { account: '4212 - Cuentas por Pagar', debit: 0, credit: 3540 },
    ],
  },
];

export default function AccountingEntries() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const filteredEntries = selectedBusiness === 'all'
    ? MOCK_ENTRIES
    : MOCK_ENTRIES.filter(e => e.businessId === selectedBusiness);

  const getBusinessName = (businessId: string) => {
    return BUSINESSES.find(b => b.id === businessId)?.name || businessId;
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

      <div className="space-y-4">
        {filteredEntries.map((entry) => {
          const totalDebit = entry.entries.reduce((sum, e) => sum + e.debit, 0);
          const totalCredit = entry.entries.reduce((sum, e) => sum + e.credit, 0);
          const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

          return (
            <Card key={entry.id} className="overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{entry.transactionId}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('es-PE')}
                      </span>
                      <Badge className="bg-primary/10 text-primary">
                        {getBusinessName(entry.businessId)}
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
                    {entry.entries.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-6 py-3 text-sm">{item.account}</td>
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
