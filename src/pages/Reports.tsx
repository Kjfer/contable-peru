import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { IncomeStatement } from '@/components/IncomeStatement';
import { BalanceSheet } from '@/components/BalanceSheet';
import { useState } from 'react';
import { toast } from 'sonner';
import { useIncomeStatementData } from '@/hooks/useIncomeStatementData';
import { useBalanceSheetData } from '@/hooks/useBalanceSheetData';
import { useBusinesses } from '@/hooks/useBusinesses';
import { exportIncomeStatementToPDF, exportBalanceSheetToPDF } from '@/lib/pdfExport';

export default function Reports() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const { data: businesses } = useBusinesses();
  const incomeData = useIncomeStatementData(selectedBusiness, selectedPeriod);
  const balanceData = useBalanceSheetData(selectedBusiness, selectedPeriod);

  const getBusinessName = () => {
    if (selectedBusiness === 'all') return 'Todos los Negocios';
    return businesses?.find(b => b.id === selectedBusiness)?.name || 'Negocio';
  };

  const getPeriodLabel = () => {
    if (selectedPeriod === 'current-month') return 'Mes Actual';
    if (selectedPeriod === 'last-month') return 'Mes Anterior';
    if (selectedPeriod === 'current-year') return 'Ano Actual';
    return selectedPeriod;
  };

  const handleExportIncomeStatement = () => {
    if (incomeData.loading) {
      toast.error('Espere a que se carguen los datos');
      return;
    }

    exportIncomeStatementToPDF({
      incomeAccounts: incomeData.incomeAccounts,
      expenseAccounts: incomeData.expenseAccounts,
      totalIncome: incomeData.totalIncome,
      totalExpenses: incomeData.totalExpenses,
      netIncome: incomeData.netIncome,
      periodLabel: getPeriodLabel(),
      businessName: getBusinessName(),
    });

    toast.success('Estado de Resultados exportado a PDF');
  };

  const handleExportBalanceSheet = () => {
    if (balanceData.loading) {
      toast.error('Espere a que se carguen los datos');
      return;
    }

    exportBalanceSheetToPDF({
      assetAccounts: balanceData.assetAccounts,
      liabilityAccounts: balanceData.liabilityAccounts,
      equityAccounts: balanceData.equityAccounts,
      totalAssets: balanceData.totalAssets,
      totalLiabilities: balanceData.totalLiabilities,
      totalEquity: balanceData.totalEquity,
      periodLabel: getPeriodLabel(),
      businessName: getBusinessName(),
    });

    toast.success('Balance General exportado a PDF');
  };

  const handleExportIGV = () => {
    toast.info('Funcionalidad de exportacion de IGV en desarrollo');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes Contables</h1>
          <p className="mt-1 text-muted-foreground">Estados financieros y reportes fiscales</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
          <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
        </div>
        <Button onClick={handleExportIGV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Declaracion IGV
        </Button>
      </div>

      <div className="space-y-6">
        {/* Estado de Resultados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Estado de Resultados</h2>
            <Button 
              onClick={handleExportIncomeStatement} 
              variant="outline" 
              className="gap-2"
              disabled={incomeData.loading}
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
          <IncomeStatement businessId={selectedBusiness} period={selectedPeriod} />
        </div>

        {/* Balance General */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Balance General</h2>
            <Button 
              onClick={handleExportBalanceSheet} 
              variant="outline" 
              className="gap-2"
              disabled={balanceData.loading}
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
          <BalanceSheet businessId={selectedBusiness} period={selectedPeriod} />
        </div>
      </div>
    </div>
  );
}
