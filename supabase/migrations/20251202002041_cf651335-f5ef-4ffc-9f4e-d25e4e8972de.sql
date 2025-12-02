-- Create chart of accounts table
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
  category TEXT NOT NULL, -- For grouping in financial statements
  parent_code TEXT,
  is_debit_balance BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_parent FOREIGN KEY (parent_code) REFERENCES public.chart_of_accounts(code) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for chart of accounts
CREATE POLICY "Allow all operations on chart_of_accounts" 
ON public.chart_of_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert comprehensive chart of accounts following Peruvian PCGE standards

-- CLASE 1: ACTIVOS (ASSETS)
-- 10 - Efectivo y Equivalentes de Efectivo
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('10', 'Efectivo y Equivalentes de Efectivo', 'asset', 'Activo Corriente', true),
('101', 'Caja', 'asset', 'Activo Corriente', true),
('1011', 'Caja Chica', 'asset', 'Activo Corriente', true),
('104', 'Cuentas Corrientes en Instituciones Financieras', 'asset', 'Activo Corriente', true),
('1041', 'BCP', 'asset', 'Activo Corriente', true),
('1042', 'Interbank', 'asset', 'Activo Corriente', true),
('106', 'Depósitos en Instituciones Financieras', 'asset', 'Activo Corriente', true),
('1061', 'Yape', 'asset', 'Activo Corriente', true);

-- 12 - Cuentas por Cobrar Comerciales
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('12', 'Cuentas por Cobrar Comerciales - Terceros', 'asset', 'Activo Corriente', true),
('121', 'Facturas por Cobrar', 'asset', 'Activo Corriente', true);

-- 33 - Inmuebles, Maquinaria y Equipo
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('33', 'Inmuebles, Maquinaria y Equipo', 'asset', 'Activo No Corriente', true),
('335', 'Muebles y Enseres', 'asset', 'Activo No Corriente', true),
('336', 'Equipos Diversos', 'asset', 'Activo No Corriente', true);

-- CLASE 4: PASIVOS (LIABILITIES)
-- 40 - Tributos, Contraprestaciones y Aportes por Pagar
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('40', 'Tributos, Contraprestaciones y Aportes por Pagar', 'liability', 'Pasivo Corriente', false),
('401', 'Gobierno Central', 'liability', 'Pasivo Corriente', false),
('4011', 'IGV - Impuesto General a las Ventas', 'liability', 'Pasivo Corriente', false),
('40111', 'IGV - Cuenta Propia', 'liability', 'Pasivo Corriente', false);

-- 42 - Cuentas por Pagar Comerciales
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('42', 'Cuentas por Pagar Comerciales - Terceros', 'liability', 'Pasivo Corriente', false),
('421', 'Facturas por Pagar', 'liability', 'Pasivo Corriente', false);

-- 46 - Cuentas por Pagar Diversas
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('46', 'Cuentas por Pagar Diversas - Terceros', 'liability', 'Pasivo Corriente', false),
('469', 'Otras Cuentas por Pagar', 'liability', 'Pasivo Corriente', false);

-- CLASE 5: PATRIMONIO (EQUITY)
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('50', 'Capital', 'equity', 'Patrimonio', false),
('501', 'Capital Social', 'equity', 'Patrimonio', false),
('59', 'Resultados Acumulados', 'equity', 'Patrimonio', false),
('591', 'Utilidades no Distribuidas', 'equity', 'Patrimonio', false);

-- CLASE 7: INGRESOS (INCOME/REVENUE)
-- 70 - Ventas
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('70', 'Ventas', 'income', 'Ingresos Operacionales', false),
('701', 'Mercaderías', 'income', 'Ingresos Operacionales', false),
('7011', 'Venta de Productos', 'income', 'Ingresos Operacionales', false),
('704', 'Prestación de Servicios', 'income', 'Ingresos Operacionales', false),
('7041', 'Venta de Servicios', 'income', 'Ingresos Operacionales', false);

-- 75 - Otros Ingresos de Gestión
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('75', 'Otros Ingresos de Gestión', 'income', 'Otros Ingresos', false),
('751', 'Servicios en Beneficio del Personal', 'income', 'Otros Ingresos', false),
('7511', 'Delivery', 'income', 'Otros Ingresos', false),
('759', 'Otros Ingresos de Gestión', 'income', 'Otros Ingresos', false),
('7591', 'Comisiones', 'income', 'Otros Ingresos', false),
('7592', 'Ingresos Extraordinarios', 'income', 'Otros Ingresos', false),
('7593', 'Reembolsos de Gastos', 'income', 'Otros Ingresos', false);

-- 77 - Ingresos Financieros
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('77', 'Ingresos Financieros', 'income', 'Ingresos Financieros', false),
('779', 'Otros Ingresos Financieros', 'income', 'Ingresos Financieros', false);

-- CLASE 6: GASTOS POR NATURALEZA (EXPENSES)
-- 60 - Compras
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('60', 'Compras', 'expense', 'Costo de Ventas', true),
('601', 'Mercaderías', 'expense', 'Costo de Ventas', true),
('6011', 'Compra de Mercaderías', 'expense', 'Costo de Ventas', true);

-- 62 - Gastos de Personal, Directores y Gerentes
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('62', 'Gastos de Personal, Directores y Gerentes', 'expense', 'Gastos Operativos', true),
('621', 'Remuneraciones', 'expense', 'Gastos Operativos', true),
('6211', 'Sueldos y Salarios', 'expense', 'Gastos Operativos', true),
('627', 'Seguridad, Previsión Social y Otras Contribuciones', 'expense', 'Gastos Operativos', true);

-- 63 - Gastos de Servicios Prestados por Terceros
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('63', 'Gastos de Servicios Prestados por Terceros', 'expense', 'Gastos Operativos', true),
('636', 'Servicios Básicos', 'expense', 'Gastos Operativos', true),
('6361', 'Energía Eléctrica', 'expense', 'Gastos Operativos', true),
('6362', 'Agua', 'expense', 'Gastos Operativos', true),
('6363', 'Teléfono e Internet', 'expense', 'Gastos Operativos', true),
('637', 'Publicidad, Publicaciones, Relaciones Públicas', 'expense', 'Gastos Operativos', true),
('6371', 'Publicidad', 'expense', 'Gastos Operativos', true),
('631', 'Transporte, Correos y Gastos de Viaje', 'expense', 'Gastos Operativos', true),
('6311', 'Transporte', 'expense', 'Gastos Operativos', true),
('632', 'Honorarios, Comisiones y Corretajes', 'expense', 'Gastos Operativos', true),
('6321', 'Honorarios Profesionales', 'expense', 'Gastos Operativos', true),
('634', 'Mantenimiento y Reparaciones', 'expense', 'Gastos Operativos', true),
('639', 'Otros Servicios Prestados por Terceros', 'expense', 'Gastos Operativos', true),
('6391', 'Alquileres', 'expense', 'Gastos Operativos', true);

-- 64 - Gastos por Tributos
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('64', 'Gastos por Tributos', 'expense', 'Gastos Operativos', true),
('641', 'Gobierno Central', 'expense', 'Gastos Operativos', true),
('6411', 'Impuestos y Contribuciones', 'expense', 'Gastos Operativos', true);

-- 65 - Otros Gastos de Gestión
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('65', 'Otros Gastos de Gestión', 'expense', 'Gastos Operativos', true),
('654', 'Seguros', 'expense', 'Gastos Operativos', true),
('655', 'Costo Neto de Enajenación de Activos Inmovilizados', 'expense', 'Gastos Operativos', true),
('656', 'Suministros', 'expense', 'Gastos Operativos', true),
('6561', 'Útiles de Oficina', 'expense', 'Gastos Operativos', true),
('659', 'Otros Gastos de Gestión', 'expense', 'Gastos Operativos', true),
('6591', 'Capacitación', 'expense', 'Gastos Operativos', true),
('6592', 'Gastos Operativos Diversos', 'expense', 'Gastos Operativos', true);

-- 67 - Gastos Financieros
INSERT INTO public.chart_of_accounts (code, name, account_type, category, is_debit_balance) VALUES
('67', 'Gastos Financieros', 'expense', 'Gastos Financieros', true),
('679', 'Otros Gastos Financieros', 'expense', 'Gastos Financieros', true),
('6791', 'Comisiones Bancarias', 'expense', 'Gastos Financieros', true);

-- Create index for faster lookups
CREATE INDEX idx_chart_of_accounts_code ON public.chart_of_accounts(code);
CREATE INDEX idx_chart_of_accounts_type ON public.chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_category ON public.chart_of_accounts(category);