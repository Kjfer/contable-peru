-- Convert account_type from ENUM to TEXT to support dynamic payment_accounts
-- This migration changes from_account and to_account columns from ENUM to TEXT

-- Step 1: Add temporary TEXT columns
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS from_account_temp TEXT,
ADD COLUMN IF NOT EXISTS to_account_temp TEXT;

-- Step 2: Copy data from ENUM to TEXT (cast ENUM to TEXT)
UPDATE public.transactions 
SET from_account_temp = from_account::text, 
    to_account_temp = to_account::text
WHERE from_account IS NOT NULL OR to_account IS NOT NULL;

-- Step 3: Drop the old constraints and columns
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_from_account_fkey CASCADE,
DROP CONSTRAINT IF EXISTS transactions_to_account_fkey CASCADE;

ALTER TABLE public.transactions 
DROP COLUMN IF EXISTS from_account,
DROP COLUMN IF EXISTS to_account;

-- Step 4: Rename temporary columns to original names
ALTER TABLE public.transactions 
RENAME COLUMN from_account_temp TO from_account;

ALTER TABLE public.transactions 
RENAME COLUMN to_account_temp TO to_account;

-- Step 5: Add foreign key constraints to payment_accounts
ALTER TABLE public.transactions
ADD CONSTRAINT transactions_from_account_fkey 
  FOREIGN KEY (from_account) REFERENCES public.payment_accounts(name) ON DELETE SET NULL,
ADD CONSTRAINT transactions_to_account_fkey 
  FOREIGN KEY (to_account) REFERENCES public.payment_accounts(name) ON DELETE SET NULL;

-- Step 6: Drop the unused account_type ENUM if it exists
DROP TYPE IF EXISTS public.account_type CASCADE;
