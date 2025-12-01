import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { BusinessFilter } from '@/components/BusinessFilter';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Card } from '@/components/ui/card';
import { MOCK_TRANSACTIONS, MOCK_INVOICES } from '@/lib/mockData';
import { calculateFinancialMetrics, calculateFinancialRatios, formatCurrency, formatPercentage } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const filteredTransactions = selectedBusiness === 'all' 
    ? MOCK_TRANSACTIONS 
    : MOCK_TRANSACTIONS.filter(t => t.businessId === selectedBusiness);

  const metrics = calculateFinancialMetrics(filteredTransactions, MOCK_INVOICES);
  const ratios = calculateFinancialRatios(100000, 40000, 60000, metrics.netProfit);

  const businessComparison = [
    { name: 'Negocio Principal', ingresos: 50000, egresos: 30000, utilidad: 20000 },
    { name: 'Sucursal Norte', ingresos: 35000, egresos: 22000, utilidad: 13000 },
    { name: 'Sucursal Sur', ingresos: 28000, egresos: 18000, utilidad: 10000 },
  ];

  const monthlyTrend = [
    { mes: 'Jul', ingresos: 45000, egresos: 28000 },
    { mes: 'Ago', ingresos: 52000, egresos: 31000 },
    { mes: 'Sep', ingresos: 48000, egresos: 29000 },
    { mes: 'Oct', ingresos: 58000, egresos: 35000 },
    { mes: 'Nov', ingresos: 62000, egresos: 38000 },
  ];

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
          value={formatCurrency(metrics.totalIncome)}
          icon={TrendingUp}
          trend={{ value: '+12.5%', isPositive: true }}
        />
        <MetricCard
          title="Egresos Totales"
          value={formatCurrency(metrics.totalExpenses)}
          icon={TrendingDown}
          trend={{ value: '+5.2%', isPositive: false }}
        />
        <MetricCard
          title="Utilidad Neta"
          value={formatCurrency(metrics.netProfit)}
          icon={DollarSign}
          trend={{ value: '+18.3%', isPositive: true }}
        />
        <MetricCard
          title="Margen de Utilidad"
          value={formatPercentage(metrics.profitMargin)}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Comparación entre Negocios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={businessComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="hsl(var(--success))" name="Ingresos" />
              <Bar dataKey="egresos" fill="hsl(var(--destructive))" name="Egresos" />
              <Bar dataKey="utilidad" fill="hsl(var(--primary))" name="Utilidad" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

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

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Ratios Financieros
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Ratio Corriente</p>
            <p className="mt-2 text-2xl font-bold financial-number">{ratios.currentRatio.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Ratio Rápido</p>
            <p className="mt-2 text-2xl font-bold financial-number">{ratios.quickRatio.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">Deuda/Patrimonio</p>
            <p className="mt-2 text-2xl font-bold financial-number">{ratios.debtToEquity.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">ROA</p>
            <p className="mt-2 text-2xl font-bold financial-number">{formatPercentage(ratios.returnOnAssets)}</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm font-medium text-muted-foreground">ROE</p>
            <p className="mt-2 text-2xl font-bold financial-number">{formatPercentage(ratios.returnOnEquity)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
