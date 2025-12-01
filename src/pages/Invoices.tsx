import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceList } from '@/components/InvoiceList';
import { MOCK_INVOICES } from '@/lib/mockData';

export default function Invoices() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showForm, setShowForm] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'sale' | 'purchase'>('sale');

  const filteredInvoices = MOCK_INVOICES.filter(
    invoice =>
      (selectedBusiness === 'all' || invoice.businessId === selectedBusiness) &&
      invoice.type === invoiceType
  );

  const handleNewInvoice = (type: 'sale' | 'purchase') => {
    setInvoiceType(type);
    setShowForm(true);
  };

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

      {showForm && (
        <Card className="p-6">
          <InvoiceForm type={invoiceType} onClose={() => setShowForm(false)} />
        </Card>
      )}

      <Tabs defaultValue="sales" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sales" onClick={() => setInvoiceType('sale')}>
              Ventas
            </TabsTrigger>
            <TabsTrigger value="purchases" onClick={() => setInvoiceType('purchase')}>
              Compras
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => handleNewInvoice(invoiceType)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>

        <TabsContent value="sales">
          <InvoiceList invoices={filteredInvoices.filter(i => i.type === 'sale')} />
        </TabsContent>

        <TabsContent value="purchases">
          <InvoiceList invoices={filteredInvoices.filter(i => i.type === 'purchase')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
