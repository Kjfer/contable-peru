-- Esquema de base de datos para Sistema Financiero
-- IMPORTANTE: Este esquema está listo para ser ejecutado en Supabase

-- =============================================
-- 1. TABLAS PRINCIPALES
-- =============================================

-- Tabla de negocios
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(195 85% 35%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_businesses_name ON public.businesses(name);

-- Tabla de categorías de transacciones
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tipos de cuenta
CREATE TYPE public.account_type AS ENUM ('BCP', 'Interbank', 'Yape', 'Caja Chica');

-- Tipos de transacción
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type public.transaction_type NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.transaction_categories(id),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  from_account public.account_type,
  to_account public.account_type,
  description TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_transactions_business ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase')),
  date DATE NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_supplier TEXT NOT NULL,
  ruc TEXT,
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  igv DECIMAL(12, 2) NOT NULL CHECK (igv >= 0),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  invoice_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- Tabla de items de facturas
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para items de facturas
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- Tabla de asientos contables (partida doble)
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_balanced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para asientos contables
CREATE INDEX IF NOT EXISTS idx_accounting_entries_business ON public.accounting_entries(business_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON public.accounting_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_transaction ON public.accounting_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_invoice ON public.accounting_entries(invoice_id);

-- Tabla de líneas de asientos contables (detalle débito/crédito)
CREATE TABLE IF NOT EXISTS public.accounting_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.accounting_entries(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  debit DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_debit_or_credit CHECK (
    (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
  )
);

-- Índices para líneas de asientos
CREATE INDEX IF NOT EXISTS idx_entry_lines_entry ON public.accounting_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_lines_account ON public.accounting_entry_lines(account_code);

-- =============================================
-- 2. TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounting_entries_updated_at
  BEFORE UPDATE ON public.accounting_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entry_lines ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para desarrollo
-- NOTA: En producción, estas políticas deben ser más restrictivas basadas en autenticación
CREATE POLICY "Allow public read access on businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on businesses"
  ON public.businesses FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on businesses"
  ON public.businesses FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on transaction_categories"
  ON public.transaction_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on transactions"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on transactions"
  ON public.transactions FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on transactions"
  ON public.transactions FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on invoices"
  ON public.invoices FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on invoices"
  ON public.invoices FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on invoices"
  ON public.invoices FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on invoice_items"
  ON public.invoice_items FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on invoice_items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on invoice_items"
  ON public.invoice_items FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on accounting_entries"
  ON public.accounting_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on accounting_entries"
  ON public.accounting_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on accounting_entries"
  ON public.accounting_entries FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on accounting_entries"
  ON public.accounting_entries FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access on accounting_entry_lines"
  ON public.accounting_entry_lines FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on accounting_entry_lines"
  ON public.accounting_entry_lines FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on accounting_entry_lines"
  ON public.accounting_entry_lines FOR DELETE
  USING (true);

-- =============================================
-- 4. DATOS INICIALES
-- =============================================

-- Insertar categorías de transacciones predefinidas
INSERT INTO public.transaction_categories (id, name, type) VALUES
  (1, 'Venta de productos', 'income'),
  (2, 'Venta de servicios', 'income'),
  (3, 'Delivery', 'income'),
  (4, 'Ingresos por comisiones', 'income'),
  (5, 'Ingresos extraordinarios', 'income'),
  (6, 'Devoluciones de gastos', 'income'),
  (7, 'Ingresos financieros (intereses)', 'income'),
  (8, 'Compra de mercadería', 'expense'),
  (9, 'Servicios básicos: Luz', 'expense'),
  (10, 'Servicios básicos: Agua', 'expense'),
  (11, 'Internet y telefonía', 'expense'),
  (12, 'Alquiler local/oficina', 'expense'),
  (13, 'Sueldos y salarios', 'expense'),
  (14, 'Honorarios profesionales', 'expense'),
  (15, 'Publicidad y marketing', 'expense'),
  (16, 'Transporte y movilidad', 'expense'),
  (17, 'Gastos bancarios', 'expense'),
  (18, 'Impuestos y tributos', 'expense'),
  (19, 'Mantenimiento', 'expense'),
  (20, 'Equipos y suministros', 'expense'),
  (21, 'Papelería y útiles', 'expense'),
  (22, 'Seguros', 'expense'),
  (23, 'Capacitación', 'expense'),
  (24, 'Otros gastos operativos', 'expense')
ON CONFLICT (id) DO NOTHING;

-- Insertar negocios de ejemplo
INSERT INTO public.businesses (name, color) VALUES
  ('Negocio Principal', 'hsl(195 85% 35%)'),
  ('Sucursal Norte', 'hsl(160 75% 45%)'),
  ('Sucursal Sur', 'hsl(38 92% 50%)')
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. FUNCIONES AUXILIARES
-- =============================================

-- Función para calcular totales de IGV
CREATE OR REPLACE FUNCTION public.calculate_igv_totals(
  p_business_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  igv_purchases DECIMAL,
  igv_sales DECIMAL,
  net_igv DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH igv_data AS (
    SELECT
      SUM(CASE WHEN type = 'purchase' THEN igv ELSE 0 END) as purchases,
      SUM(CASE WHEN type = 'sale' THEN igv ELSE 0 END) as sales
    FROM public.invoices
    WHERE
      (p_business_id IS NULL OR business_id = p_business_id)
      AND (p_start_date IS NULL OR date >= p_start_date)
      AND (p_end_date IS NULL OR date <= p_end_date)
  )
  SELECT
    COALESCE(purchases, 0)::DECIMAL as igv_purchases,
    COALESCE(sales, 0)::DECIMAL as igv_sales,
    (COALESCE(sales, 0) - COALESCE(purchases, 0))::DECIMAL as net_igv
  FROM igv_data;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener balance de cuenta (libro mayor)
CREATE OR REPLACE FUNCTION public.get_account_balance(
  p_account_code TEXT,
  p_business_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_debit DECIMAL,
  total_credit DECIMAL,
  balance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(debit), 0)::DECIMAL as total_debit,
    COALESCE(SUM(credit), 0)::DECIMAL as total_credit,
    (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0))::DECIMAL as balance
  FROM public.accounting_entry_lines el
  INNER JOIN public.accounting_entries e ON el.entry_id = e.id
  WHERE
    el.account_code = p_account_code
    AND (p_business_id IS NULL OR e.business_id = p_business_id)
    AND (p_start_date IS NULL OR e.date >= p_start_date)
    AND (p_end_date IS NULL OR e.date <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTARIOS
-- =============================================

COMMENT ON TABLE public.businesses IS 'Negocios o sucursales de la empresa';
COMMENT ON TABLE public.transaction_categories IS 'Categorías predefinidas para clasificar transacciones';
COMMENT ON TABLE public.transactions IS 'Registro de todas las transacciones: ingresos, egresos y transferencias';
COMMENT ON TABLE public.invoices IS 'Facturas de compras y ventas con cálculo de IGV';
COMMENT ON TABLE public.invoice_items IS 'Detalle de items en cada factura';
COMMENT ON TABLE public.accounting_entries IS 'Asientos contables de partida doble';
COMMENT ON TABLE public.accounting_entry_lines IS 'Líneas de débito y crédito de cada asiento contable';
