import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';

interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  igvCompras: number;
  igvVentas: number;
  creditoFiscalNeto: number;
  monthlyTrend: Array<{ mes: string; ingresos: number; egresos: number }>;
}

interface UseDashboardMetricsOptions {
  businessId?: string;
  period?: string;
}

export function useDashboardMetrics(options: UseDashboardMetricsOptions = {}) {
  const { businessId = 'all', period = 'current-month' } = options;
  const { startDate, endDate } = getDateRangeFromPeriod(period);

  return useQuery({
    queryKey: ['dashboard_metrics', businessId, period],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Fetch transactions for income/expenses
      let transactionsQuery = supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (businessId !== 'all') {
        transactionsQuery = transactionsQuery.eq('business_id', businessId);
      }

      const { data: transactions, error: transactionsError } = await transactionsQuery;
      if (transactionsError) throw transactionsError;

      // Calculate totals from transactions
      const totalIncome = (transactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = (transactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

      // Fetch IGV totals using the database function
      const { data: igvData, error: igvError } = await supabase
        .rpc('calculate_igv_totals', {
          business_filter: businessId === 'all' ? null : businessId,
          start_date: startDate,
          end_date: endDate,
        });

      if (igvError) throw igvError;

      const igvResult = igvData?.[0] || { igv_ventas: 0, igv_compras: 0, credito_fiscal: 0 };

      // Calculate monthly trend (last 5 months)
      const monthlyTrend = await calculateMonthlyTrend(businessId);

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        igvCompras: Number(igvResult.igv_compras) || 0,
        igvVentas: Number(igvResult.igv_ventas) || 0,
        creditoFiscalNeto: Number(igvResult.credito_fiscal) || 0,
        monthlyTrend,
      };
    },
  });
}

async function calculateMonthlyTrend(businessId: string): Promise<Array<{ mes: string; ingresos: number; egresos: number }>> {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const result: Array<{ mes: string; ingresos: number; egresos: number }> = [];
  
  const now = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    
    let query = supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (businessId !== 'all') {
      query = query.eq('business_id', businessId);
    }
    
    const { data: transactions } = await query;
    
    const ingresos = (transactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const egresos = (transactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    result.push({
      mes: months[month],
      ingresos,
      egresos,
    });
  }
  
  return result;
}
