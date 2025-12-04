import { Transaction } from '@/types/accounting';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useTransactionCategories } from '@/hooks/useTransactionCategories';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Receipt } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { data: businesses } = useBusinesses();
  const { data: categories } = useTransactionCategories();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'expense':
        return <ArrowDownRight className="h-4 w-4 text-destructive" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-primary" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Ingreso';
      case 'expense':
        return 'Egreso';
      case 'transfer':
        return 'Transferencia';
      default:
        return type;
    }
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return '-';
    return categories?.find(c => c.id === categoryId)?.name || '-';
  };

  const getBusinessName = (businessId: string) => {
    return businesses?.find(b => b.id === businessId)?.name || businessId;
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Negocio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Categoría</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Cuentas</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Monto</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Factura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm">
                  {new Date(transaction.date).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="text-sm">{getTransactionTypeLabel(transaction.type)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{getBusinessName(transaction.businessId)}</td>
                <td className="px-6 py-4 text-sm">{getCategoryName(transaction.categoryId)}</td>
                <td className="px-6 py-4 text-sm">{transaction.description}</td>
                <td className="px-6 py-4 text-sm">
                  {transaction.type === 'transfer' && transaction.fromAccount && transaction.toAccount ? (
                    <Badge variant="outline">
                      {transaction.fromAccount} → {transaction.toAccount}
                    </Badge>
                  ) : transaction.type === 'expense' && transaction.fromAccount ? (
                    <Badge variant="outline">
                      {transaction.fromAccount}
                    </Badge>
                  ) : transaction.type === 'income' && transaction.toAccount ? (
                    <Badge variant="outline">
                      {transaction.toAccount}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`financial-number text-sm font-semibold ${
                      transaction.type === 'income'
                        ? 'text-success'
                        : transaction.type === 'expense'
                        ? 'text-destructive'
                        : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {transaction.isInvoiced ? (
                    <Badge variant="secondary" className="gap-1">
                      <Receipt className="h-3 w-3" />
                      Sí
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
