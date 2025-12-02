import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { IncomeStatement } from '@/components/IncomeStatement';
import { BalanceSheet } from '@/components/BalanceSheet';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Reports() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const handleExportIncomeStatement = () => {
    toast.success('Exportando Estado de Resultados a PDF');
    // Aquí iría la lógica de exportación a PDF
  };

  const handleExportBalanceSheet = () => {
    toast.success('Exportando Balance General a PDF');
    // Aquí iría la lógica de exportación a PDF
  };

  const handleExportIGV = () => {
    toast.success('Exportando Declaración de IGV a PDF');
    // Aquí iría la lógica de exportación a PDF
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
          Exportar Declaración IGV
        </Button>
      </div>

      <div className="space-y-6">
        {/* Estado de Resultados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Estado de Resultados</h2>
            <Button onClick={handleExportIncomeStatement} variant="outline" className="gap-2">
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
            <Button onClick={handleExportBalanceSheet} variant="outline" className="gap-2">
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
