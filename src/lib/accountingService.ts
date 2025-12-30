import { supabase } from '@/integrations/supabase/client';

// Mapeo de cuentas contables según tipo de transacción y categoría
const ACCOUNT_MAPPING = {
  // Cuentas de efectivo
  'BCP': '1041',
  'Interbank': '1042',
  'Yape': '1043',
  'Caja Chica': '1011',
  
  // Cuentas por categoría de ingreso
  income: {
    1: { debit: '1041', credit: '7011', name: 'Venta de productos' },
    2: { debit: '1041', credit: '7041', name: 'Servicios prestados' },
    3: { debit: '1041', credit: '7591', name: 'Delivery' },
    4: { debit: '1041', credit: '7592', name: 'Comisiones' },
    5: { debit: '1041', credit: '7593', name: 'Ingresos extraordinarios' },
    6: { debit: '1041', credit: '7594', name: 'Reembolso de gastos' },
    7: { debit: '1041', credit: '7711', name: 'Ingresos financieros' },
  },
  
  // Cuentas por categoría de gasto
  expense: {
    8: { debit: '6011', credit: '1041', name: 'Compra de mercadería' },
    9: { debit: '6361', credit: '1041', name: 'Servicios públicos' },
    10: { debit: '6362', credit: '1041', name: 'Internet y teléfono' },
    11: { debit: '6352', credit: '1041', name: 'Alquiler' },
    12: { debit: '6211', credit: '1041', name: 'Sueldos' },
    13: { debit: '6212', credit: '1041', name: 'Honorarios profesionales' },
    14: { debit: '6371', credit: '1041', name: 'Publicidad' },
    15: { debit: '6311', credit: '1041', name: 'Transporte' },
    16: { debit: '6391', credit: '1041', name: 'Comisiones bancarias' },
    17: { debit: '6411', credit: '1041', name: 'Impuestos' },
    18: { debit: '6343', credit: '1041', name: 'Mantenimiento' },
    19: { debit: '3361', credit: '1041', name: 'Equipos' },
    20: { debit: '6563', credit: '1041', name: 'Suministros de oficina' },
    21: { debit: '6521', credit: '1041', name: 'Seguros' },
    22: { debit: '6571', credit: '1041', name: 'Capacitación' },
    23: { debit: '6599', credit: '1041', name: 'Otros gastos operativos' },
  },
};

// Obtener código de cuenta según el tipo de cuenta
function getAccountCode(accountType: string): string {
  return ACCOUNT_MAPPING[accountType as keyof typeof ACCOUNT_MAPPING] as string || '1041';
}

// Obtener nombre de cuenta desde la base de datos
async function getAccountName(code: string): Promise<string> {
  const { data } = await supabase
    .from('chart_of_accounts')
    .select('name')
    .eq('code', code)
    .maybeSingle();
  return data?.name || `Cuenta ${code}`;
}

interface TransactionData {
  date: string;
  type: 'income' | 'expense' | 'transfer';
  businessId: string;
  categoryId?: number;
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  description: string;
  reference?: string;
  isInvoiced?: boolean;
  invoiceNumber?: string;
  clientSupplier?: string;
  ruc?: string;
  currency?: string;
  idReferenced?: string;
}

interface InvoiceData {
  type: 'sale' | 'purchase';
  date: string;
  businessId: string;
  clientSupplier: string;
  ruc?: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  igv: number;
  total: number;
}

// Crear transacción con asiento contable (función interna)
async function createTransaction(data: TransactionData) {
  // 1. Insertar la transacción
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      date: data.date,
      type: data.type,
      business_id: data.businessId,
      category_id: data.categoryId || null,
      amount: data.amount,
      from_account: data.fromAccount || null,
      to_account: data.toAccount || null,
      description: data.description,
      reference: data.reference || null,
      is_invoiced: data.isInvoiced || false,
      currency: data.currency || 'PEN',
      id_referenced: data.idReferenced || null,
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // 2. Generar asiento contable
  let debitAccount: string;
  let creditAccount: string;
  let entryDescription: string;

  if (data.type === 'transfer') {
    // Transferencia entre cuentas
    debitAccount = getAccountCode(data.toAccount || 'BCP');
    creditAccount = getAccountCode(data.fromAccount || 'BCP');
    entryDescription = `Transferencia de ${data.fromAccount} a ${data.toAccount}`;
  } else if (data.type === 'income') {
    const mapping = ACCOUNT_MAPPING.income[data.categoryId as keyof typeof ACCOUNT_MAPPING.income];
    debitAccount = data.toAccount ? getAccountCode(data.toAccount) : mapping?.debit || '1041';
    creditAccount = mapping?.credit || '7011';
    entryDescription = mapping?.name || data.description;
  } else {
    const mapping = ACCOUNT_MAPPING.expense[data.categoryId as keyof typeof ACCOUNT_MAPPING.expense];
    debitAccount = mapping?.debit || '6599';
    creditAccount = data.fromAccount ? getAccountCode(data.fromAccount) : mapping?.credit || '1041';
    entryDescription = mapping?.name || data.description;
  }

  // 3. Crear asiento contable
  const { data: entry, error: entryError } = await supabase
    .from('accounting_entries')
    .insert({
      date: data.date,
      business_id: data.businessId,
      description: `${entryDescription} - ${data.description}`,
      transaction_id: transaction.id,
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // 4. Obtener nombres de cuentas
  const [debitName, creditName] = await Promise.all([
    getAccountName(debitAccount),
    getAccountName(creditAccount),
  ]);

  // 5. Crear líneas del asiento (debe y haber)
  const { error: linesError } = await supabase
    .from('accounting_entry_lines')
    .insert([
      {
        entry_id: entry.id,
        account_code: debitAccount,
        account_name: debitName,
        debit: data.amount,
        credit: 0,
      },
      {
        entry_id: entry.id,
        account_code: creditAccount,
        account_name: creditName,
        debit: 0,
        credit: data.amount,
      },
    ]);

  if (linesError) throw linesError;

  return { transaction, entry };
}

// Crear transacción con factura opcional
export async function createTransactionWithInvoice(data: TransactionData) {
  // Si no es facturada o es transferencia, crear solo la transacción
  if (!data.isInvoiced || data.type === 'transfer') {
    return createTransaction(data);
  }

  // Calcular IGV (18%)
  const subtotal = data.amount / 1.18;
  const igv = data.amount - subtotal;

  // 1. Crear la factura
  const invoiceType = data.type === 'income' ? 'sale' : 'purchase';
  
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      type: invoiceType,
      date: data.date,
      business_id: data.businessId,
      client_supplier: data.clientSupplier || 'Sin nombre',
      ruc: data.ruc || null,
      invoice_number: data.invoiceNumber || '',
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      total: data.amount,
      currency: data.currency || 'PEN',
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // 2. Crear item de factura
  const { error: itemError } = await supabase
    .from('invoice_items')
    .insert({
      invoice_id: invoice.id,
      description: data.description,
      quantity: 1,
      unit_price: subtotal,
      total: subtotal,
    });

  if (itemError) throw itemError;

  // 3. Crear la transacción vinculada a la factura
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      date: data.date,
      type: data.type,
      business_id: data.businessId,
      category_id: data.categoryId || null,
      amount: data.amount,
      from_account: data.fromAccount || null,
      to_account: data.toAccount || null,
      description: data.description,
      reference: data.invoiceNumber || data.reference || null,
      is_invoiced: true,
      invoice_id: invoice.id,
      currency: data.currency || 'PEN',
      id_referenced: data.idReferenced || null,
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // 4. Crear asiento contable para la factura
  let entryDescription: string;
  let lines: Array<{ account_code: string; account_name: string; debit: number; credit: number }>;

  if (invoiceType === 'sale') {
    entryDescription = `Factura venta ${data.invoiceNumber} - ${data.clientSupplier}`;
    
    const [cuentasCobrarName, ventasName, igvName] = await Promise.all([
      getAccountName('1212'),
      getAccountName('7011'),
      getAccountName('4011'),
    ]);

    lines = [
      { account_code: '1212', account_name: cuentasCobrarName, debit: data.amount, credit: 0 },
      { account_code: '7011', account_name: ventasName, debit: 0, credit: Math.round(subtotal * 100) / 100 },
      { account_code: '4011', account_name: igvName, debit: 0, credit: Math.round(igv * 100) / 100 },
    ];
  } else {
    entryDescription = `Factura compra ${data.invoiceNumber} - ${data.clientSupplier}`;
    
    const [comprasName, igvCreditoName, cuentasPagarName] = await Promise.all([
      getAccountName('6011'),
      getAccountName('4011'),
      getAccountName('4212'),
    ]);

    lines = [
      { account_code: '6011', account_name: comprasName, debit: Math.round(subtotal * 100) / 100, credit: 0 },
      { account_code: '4011', account_name: igvCreditoName, debit: Math.round(igv * 100) / 100, credit: 0 },
      { account_code: '4212', account_name: cuentasPagarName, debit: 0, credit: data.amount },
    ];
  }

  // 5. Crear asiento contable
  const { data: entry, error: entryError } = await supabase
    .from('accounting_entries')
    .insert({
      date: data.date,
      business_id: data.businessId,
      description: entryDescription,
      transaction_id: transaction.id,
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // 6. Crear líneas del asiento
  const linesToInsert = lines.map(line => ({
    entry_id: entry.id,
    ...line,
  }));

  const { error: linesError } = await supabase
    .from('accounting_entry_lines')
    .insert(linesToInsert);

  if (linesError) throw linesError;

  return { transaction, invoice, entry };
}

// Crear factura con asiento contable
export async function createInvoice(data: InvoiceData) {
  // 1. Insertar la factura
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      type: data.type,
      date: data.date,
      business_id: data.businessId,
      client_supplier: data.clientSupplier,
      ruc: data.ruc || null,
      invoice_number: data.invoiceNumber,
      subtotal: data.subtotal,
      igv: data.igv,
      total: data.total,
    })
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // 2. Insertar items de la factura
  const itemsToInsert = data.items.map(item => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  // 3. Crear asiento contable para la factura
  let entryDescription: string;
  let lines: Array<{ account_code: string; account_name: string; debit: number; credit: number }>;

  if (data.type === 'sale') {
    // Venta: Débito a Cuentas por Cobrar, Crédito a Ventas e IGV
    entryDescription = `Factura venta ${data.invoiceNumber} - ${data.clientSupplier}`;
    
    const [cuentasCobrarName, ventasName, igvName] = await Promise.all([
      getAccountName('1212'),
      getAccountName('7011'),
      getAccountName('4011'),
    ]);

    lines = [
      { account_code: '1212', account_name: cuentasCobrarName, debit: data.total, credit: 0 },
      { account_code: '7011', account_name: ventasName, debit: 0, credit: data.subtotal },
      { account_code: '4011', account_name: igvName, debit: 0, credit: data.igv },
    ];
  } else {
    // Compra: Débito a Compras e IGV Crédito Fiscal, Crédito a Cuentas por Pagar
    entryDescription = `Factura compra ${data.invoiceNumber} - ${data.clientSupplier}`;
    
    const [comprasName, igvCreditoName, cuentasPagarName] = await Promise.all([
      getAccountName('6011'),
      getAccountName('4011'),
      getAccountName('4212'),
    ]);

    lines = [
      { account_code: '6011', account_name: comprasName, debit: data.subtotal, credit: 0 },
      { account_code: '4011', account_name: igvCreditoName, debit: data.igv, credit: 0 },
      { account_code: '4212', account_name: cuentasPagarName, debit: 0, credit: data.total },
    ];
  }

  // 4. Crear asiento contable
  const { data: entry, error: entryError } = await supabase
    .from('accounting_entries')
    .insert({
      date: data.date,
      business_id: data.businessId,
      description: entryDescription,
    })
    .select()
    .single();

  if (entryError) throw entryError;

  // 5. Crear líneas del asiento
  const linesToInsert = lines.map(line => ({
    entry_id: entry.id,
    ...line,
  }));

  const { error: linesError } = await supabase
    .from('accounting_entry_lines')
    .insert(linesToInsert);

  if (linesError) throw linesError;

  return { invoice, entry };
}

// Obtener negocios desde Supabase
export async function getBusinesses() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

// Obtener categorías de transacción
export async function getTransactionCategories() {
  const { data, error } = await supabase
    .from('transaction_categories')
    .select('*')
    .order('id');
  
  if (error) throw error;
  return data;
}
