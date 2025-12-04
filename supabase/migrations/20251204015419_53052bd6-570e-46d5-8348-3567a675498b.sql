-- Add is_invoiced flag to transactions table
ALTER TABLE public.transactions 
ADD COLUMN is_invoiced boolean NOT NULL DEFAULT false;

-- Add invoice_id to link transaction with invoice when applicable
ALTER TABLE public.transactions 
ADD COLUMN invoice_id text REFERENCES public.invoices(id) ON DELETE SET NULL;