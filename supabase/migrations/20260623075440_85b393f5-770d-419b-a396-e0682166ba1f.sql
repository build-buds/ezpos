
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS kitchen_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS kitchen_updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_kitchen_status_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_kitchen_status_check
  CHECK (kitchen_status IN ('pending','cooking','ready','served'));

CREATE INDEX IF NOT EXISTS idx_transactions_kitchen
  ON public.transactions (business_id, kitchen_status, created_at);

ALTER TABLE public.transactions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions';
  END IF;
END $$;
