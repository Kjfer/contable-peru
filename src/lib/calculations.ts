import { Transaction, Invoice, FinancialMetrics, FinancialRatios } from '@/types/accounting';

export const IGV_RATE = 0.18;

export function calculateIGV(subtotal: number): number {
  return Math.round(subtotal * IGV_RATE * 100) / 100;
}

export function calculateTotal(subtotal: number): number {
  return subtotal + calculateIGV(subtotal);
}

export function calculateFinancialMetrics(
  transactions: Transaction[],
  invoices: Invoice[]
): FinancialMetrics {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  const cashFlow = netProfit;

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin,
    cashFlow,
  };
}

export function calculateFinancialRatios(
  assets: number,
  liabilities: number,
  equity: number,
  netProfit: number
): FinancialRatios {
  const currentRatio = liabilities > 0 ? assets / liabilities : 0;
  const quickRatio = currentRatio * 0.8; // Simplified
  const debtToEquity = equity > 0 ? liabilities / equity : 0;
  const returnOnAssets = assets > 0 ? (netProfit / assets) * 100 : 0;
  const returnOnEquity = equity > 0 ? (netProfit / equity) * 100 : 0;

  return {
    currentRatio,
    quickRatio,
    debtToEquity,
    returnOnAssets,
    returnOnEquity,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
