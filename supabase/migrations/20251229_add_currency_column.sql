-- Add currency column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'PEN';

-- Create an index for faster queries by currency
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON public.transactions(currency);

-- Add check constraint to ensure valid currencies
ALTER TABLE public.transactions
ADD CONSTRAINT chk_valid_currency CHECK (
  currency IN 
);

-- Update the updated_at column for existing transactions
UPDATE public.transactions 
SET updated_at = NOW() 
WHERE currency = 'PEN' AND updated_at < NOW();
