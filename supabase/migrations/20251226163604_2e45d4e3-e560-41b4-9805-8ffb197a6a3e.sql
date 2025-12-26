-- Create payment_accounts table
CREATE TABLE public.payment_accounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'bank', -- 'bank', 'wallet', 'cash'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on payment_accounts" 
ON public.payment_accounts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert initial payment accounts
INSERT INTO public.payment_accounts (name, type) VALUES
  ('BCP', 'bank'),
  ('Interbank', 'bank'),
  ('Banco de la Nación', 'bank'),
  ('BBVA', 'bank'),
  ('Scotiabank', 'bank'),
  ('Yape', 'wallet'),
  ('Plin', 'wallet'),
  ('Tarjeta LINK', 'wallet'),
  ('En Efectivo', 'cash');