import { Business, Transaction, Invoice } from '@/types/accounting';

export const BUSINESSES: Business[] = [
  { id: 'all', name: 'Todos los negocios', color: 'hsl(var(--primary))' },
  { id: 'negocio1', name: 'Negocio Principal', color: 'hsl(195 85% 35%)' },
  { id: 'negocio2', name: 'Sucursal Norte', color: 'hsl(160 75% 45%)' },
  { id: 'negocio3', name: 'Sucursal Sur', color: 'hsl(38 92% 50%)' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2025-11-15',
    type: 'income',
    businessId: 'negocio1',
    categoryId: 1,
    amount: 5000,
    description: 'Venta del día',
    reference: 'VTA-001',
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: '2',
    date: '2025-11-16',
    type: 'expense',
    businessId: 'negocio1',
    categoryId: 13,
    amount: 3000,
    description: 'Pago de planilla',
    reference: 'PLA-001',
    createdAt: '2025-11-16T14:00:00Z',
  },
  {
    id: '3',
    date: '2025-11-17',
    type: 'transfer',
    businessId: 'negocio2',
    amount: 2000,
    fromAccount: 'BCP',
    toAccount: 'Caja Chica',
    description: 'Transferencia para gastos operativos',
    reference: 'TRF-001',
    createdAt: '2025-11-17T09:00:00Z',
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    type: 'sale',
    date: '2025-11-15',
    businessId: 'negocio1',
    clientSupplier: 'Cliente ABC SAC',
    ruc: '20123456789',
    subtotal: 5000,
    igv: 900,
    total: 5900,
    invoiceNumber: 'F001-00001',
    items: [
      { description: 'Producto A', quantity: 10, unitPrice: 500, total: 5000 },
    ],
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'purchase',
    date: '2025-11-10',
    businessId: 'negocio1',
    clientSupplier: 'Proveedor XYZ SAC',
    ruc: '20987654321',
    subtotal: 3000,
    igv: 540,
    total: 3540,
    invoiceNumber: 'F002-00050',
    items: [
      { description: 'Materia Prima B', quantity: 5, unitPrice: 600, total: 3000 },
    ],
    createdAt: '2025-11-10T15:00:00Z',
  },
];
