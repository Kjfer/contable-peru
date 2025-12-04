import { useState } from 'react';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { ImportDialog } from '@/components/ImportDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinesses } from '@/hooks/useBusinesses';

export default function Transactions() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data: transactions, isLoading, error, refetch } = useTransactions({
    businessId: selectedBusiness,
    period: selectedPeriod,
  });

  const { data: businesses } = useBusinesses();

  const formattedTransactions = (transactions || []).map(t => ({
    id: t.id,
    date: t.date,
    type: t.type as 'income' | 'expense' | 'transfer',
    businessId: t.business_id,
    categoryId: t.category_id || 0,
    description: t.description || '',
    amount: Number(t.amount),
    fromAccount: t.from_account || undefined,
    toAccount: t.to_account || undefined,
    reference: t.reference || undefined,
    isInvoiced: t.is_invoiced || false,
    invoiceId: t.invoice_id || undefined,
  }));

  const handleFormClose = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
          <p className="mt-1 text-muted-foreground">Gestión de ingresos, egresos y transferencias</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImport(true)} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
          </DialogHeader>
          <TransactionForm onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <ImportDialog open={showImport} onOpenChange={setShowImport} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Error al cargar transacciones
        </div>
      ) : (
        <TransactionList transactions={formattedTransactions} />
      )}
    </div>
  );
}
