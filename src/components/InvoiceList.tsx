import { Invoice } from '@/types/accounting';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import { BUSINESSES } from '@/lib/mockData';

interface InvoiceListProps {
  invoices: Invoice[];
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const getBusinessName = (businessId: string) => {
    return BUSINESSES.find(b => b.id === businessId)?.name || businessId;
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">N° Factura</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Negocio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                {invoices[0]?.type === 'sale' ? 'Cliente' : 'Proveedor'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">RUC</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Subtotal</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">IGV</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm">
                  {new Date(invoice.date).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{invoice.invoiceNumber}</Badge>
                </td>
                <td className="px-6 py-4 text-sm">{getBusinessName(invoice.businessId)}</td>
                <td className="px-6 py-4 text-sm">{invoice.clientSupplier}</td>
                <td className="px-6 py-4 text-sm font-mono">{invoice.ruc || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <span className="financial-number text-sm">{formatCurrency(invoice.subtotal)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="financial-number text-sm text-muted-foreground">
                    {formatCurrency(invoice.igv)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`financial-number text-sm font-semibold ${
                      invoice.type === 'sale' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(invoice.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
