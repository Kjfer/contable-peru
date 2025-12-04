import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceList } from '@/components/InvoiceList';
import { useInvoices } from '@/hooks/useInvoices';

export default function Invoices() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showForm, setShowForm] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase'>('sale');
  const [activeTab, setActiveTab] = useState('sales');

  const { data: salesInvoices, isLoading: loadingSales, refetch: refetchSales } = useInvoices({
    businessId: selectedBusiness,
    period: selectedPeriod,
    type: 'sale',
  });

  const { data: purchaseInvoices, isLoading: loadingPurchases, refetch: refetchPurchases } = useInvoices({
    businessId: selectedBusiness,
    period: selectedPeriod,
    type: 'purchase',
  });

  const handleNewInvoice = (type: 'sale' | 'purchase') => {
    setInvoiceType(type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    refetchSales();
    refetchPurchases();
  };

  const formatInvoices = (invoices: any[]) => invoices.map(inv => ({
    id: inv.id,
    date: inv.date,
    invoiceNumber: inv.invoice_number,
    businessId: inv.business_id,
    type: inv.type as 'sale' | 'purchase',
    clientSupplier: inv.client_supplier,
    ruc: inv.ruc || '',
    subtotal: Number(inv.subtotal),
    igv: Number(inv.igv),
    total: Number(inv.total),
  }));

  const isLoading = loadingSales || loadingPurchases;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturación</h1>
          <p className="mt-1 text-muted-foreground">Gestión de facturas de compras y ventas</p>
        </div>
      </div>

      <div className="flex gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Nueva Factura de {invoiceType === 'sale' ? 'Venta' : 'Compra'}
            </DialogTitle>
          </DialogHeader>
          <InvoiceForm type={invoiceType} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sales" onClick={() => setInvoiceType('sale')}>
              Ventas
            </TabsTrigger>
            <TabsTrigger value="purchases" onClick={() => setInvoiceType('purchase')}>
              Compras
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => handleNewInvoice(activeTab === 'sales' ? 'sale' : 'purchase')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="sales">
              <InvoiceList invoices={formatInvoices(salesInvoices || [])} />
            </TabsContent>

            <TabsContent value="purchases">
              <InvoiceList invoices={formatInvoices(purchaseInvoices || [])} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
