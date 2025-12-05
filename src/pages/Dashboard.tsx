import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Receipt, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const { data: metrics, isLoading } = useDashboardMetrics({
    businessId: selectedBusiness,
    period: selectedPeriod,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const {
    totalIncome = 0,
    totalExpenses = 0,
    netProfit = 0,
    profitMargin = 0,
    igvCompras = 0,
    igvVentas = 0,
    creditoFiscalNeto = 0,
    monthlyTrend = [],
  } = metrics || {};

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financiero</h1>
          <p className="mt-1 text-muted-foreground">Resumen general de métricas financieras</p>
        </div>
        <div className="flex gap-4">
          <PeriodFilter value={selectedPeriod} onChange={setSelectedPeriod} />
          <BusinessFilter value={selectedBusiness} onChange={setSelectedBusiness} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
        />
        <MetricCard
          title="Egresos Totales"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
        />
        <MetricCard
          title="Utilidad Neta"
          value={formatCurrency(netProfit)}
          icon={DollarSign}
        />
        <MetricCard
          title="Margen de Utilidad"
          value={formatPercentage(profitMargin)}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 transition-all hover:shadow-lg border-l-4 border-l-destructive">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">IGV Compras (Crédito Fiscal)</p>
              <p className="mt-2 text-3xl font-bold financial-number text-destructive">{formatCurrency(igvCompras)}</p>
              <p className="mt-2 text-xs text-muted-foreground">A favor de la empresa</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3">
              <Receipt className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all hover:shadow-lg border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">IGV Ventas (Débito Fiscal)</p>
              <p className="mt-2 text-3xl font-bold financial-number text-success">{formatCurrency(igvVentas)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Por pagar a SUNAT</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3">
              <Receipt className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-all hover:shadow-lg border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">IGV Neto a Declarar</p>
              <p className={`mt-2 text-3xl font-bold financial-number ${creditoFiscalNeto >= 0 ? 'text-primary' : 'text-accent'}`}>
                {formatCurrency(Math.abs(creditoFiscalNeto))}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {creditoFiscalNeto >= 0 ? 'A pagar' : 'A favor'}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Tendencia Mensual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="mes" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="ingresos" stroke="hsl(var(--success))" strokeWidth={2} name="Ingresos" />
            <Line type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" strokeWidth={2} name="Egresos" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
