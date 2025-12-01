import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Reports() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const reports = [
    {
      id: 'income-statement',
      title: 'Estado de Resultados',
      description: 'Reporte de ingresos y egresos del período',
      icon: FileText,
    },
    {
      id: 'balance-sheet',
      title: 'Balance General',
      description: 'Situación patrimonial de la empresa',
      icon: FileText,
    },
    {
      id: 'sales-book',
      title: 'Libro de Ventas',
      description: 'Registro de todas las facturas de venta',
      icon: FileText,
    },
    {
      id: 'purchase-book',
      title: 'Libro de Compras',
      description: 'Registro de todas las facturas de compra',
      icon: FileText,
    },
    {
      id: 'igv-declaration',
      title: 'Declaración de IGV',
      description: 'Resumen de IGV a declarar ante SUNAT',
      icon: FileText,
    },
    {
      id: 'general-ledger',
      title: 'Libro Mayor',
      description: 'Movimientos de partida doble por cuenta',
      icon: FileText,
    },
  ];

  const handleExport = (reportId: string) => {
    toast.success(`Exportando reporte: ${reports.find(r => r.id === reportId)?.title}`);
    // Aquí iría la lógica de exportación a PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes Contables</h1>
          <p className="mt-1 text-muted-foreground">Exporta reportes financieros en PDF</p>
        </div>
      </div>

      <div className="flex gap-4">
        <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
        <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-6 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => handleExport(report.id)}
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
