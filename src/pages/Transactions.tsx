import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { MOCK_TRANSACTIONS } from '@/lib/mockData';

export default function Transactions() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showForm, setShowForm] = useState(false);

  const filteredTransactions = selectedBusiness === 'all'
    ? MOCK_TRANSACTIONS
    : MOCK_TRANSACTIONS.filter(t => t.businessId === selectedBusiness);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transacciones</h1>
          <p className="mt-1 text-muted-foreground">Gestión de ingresos, egresos y transferencias</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <div className="flex gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
      </div>

      {showForm && (
        <Card className="p-6">
          <TransactionForm onClose={() => setShowForm(false)} />
        </Card>
      )}

      <TransactionList transactions={filteredTransactions} />
    </div>
  );
}
