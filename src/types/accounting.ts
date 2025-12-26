export type TransactionType = 'income' | 'expense' | 'transfer';

// AccountType is now dynamic from the database, but we keep it as string for compatibility
export type AccountType = string;

export interface Business {
  id: string;
  name: string;
  color: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  businessId: string;
  categoryId?: number;
  amount: number;
  fromAccount?: AccountType | string;
  toAccount?: AccountType | string;
  description: string;
  reference?: string;
  createdAt?: string;
  isInvoiced?: boolean;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  type: 'sale' | 'purchase';
  date: string;
  businessId: string;
  clientSupplier: string;
  ruc?: string;
  subtotal: number;
  igv: number;
  total: number;
  items?: InvoiceItem[];
  invoiceNumber: string;
  createdAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DoubleEntry {
  id: string;
  transactionId: string;
  date: string;
  account: string;
  debit: number;
  credit: number;
  description: string;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashFlow: number;
}

export interface FinancialRatios {
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  returnOnAssets: number;
  returnOnEquity: number;
}

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  { id: 1, name: 'Venta de productos', type: 'income' },
  { id: 2, name: 'Venta de servicios', type: 'income' },
  { id: 3, name: 'Delivery', type: 'income' },
  { id: 4, name: 'Ingresos por comisiones', type: 'income' },
  { id: 5, name: 'Ingresos extraordinarios', type: 'income' },
  { id: 6, name: 'Devoluciones de gastos', type: 'income' },
  { id: 7, name: 'Ingresos financieros (intereses)', type: 'income' },
  { id: 8, name: 'Compra de mercadería', type: 'expense' },
  { id: 9, name: 'Servicios básicos: Luz', type: 'expense' },
  { id: 10, name: 'Servicios básicos: Agua', type: 'expense' },
  { id: 11, name: 'Internet y telefonía', type: 'expense' },
  { id: 12, name: 'Alquiler local/oficina', type: 'expense' },
  { id: 13, name: 'Sueldos y salarios', type: 'expense' },
  { id: 14, name: 'Honorarios profesionales', type: 'expense' },
  { id: 15, name: 'Publicidad y marketing', type: 'expense' },
  { id: 16, name: 'Transporte y movilidad', type: 'expense' },
  { id: 17, name: 'Gastos bancarios', type: 'expense' },
  { id: 18, name: 'Impuestos y tributos', type: 'expense' },
  { id: 19, name: 'Mantenimiento', type: 'expense' },
  { id: 20, name: 'Equipos y suministros', type: 'expense' },
  { id: 21, name: 'Papelería y útiles', type: 'expense' },
  { id: 22, name: 'Seguros', type: 'expense' },
  { id: 23, name: 'Capacitación', type: 'expense' },
  { id: 24, name: 'Otros gastos operativos', type: 'expense' },
];

// ACCOUNT_TYPES is now fetched from the database via usePaymentAccounts hook
export const ACCOUNT_TYPES: AccountType[] = [];
