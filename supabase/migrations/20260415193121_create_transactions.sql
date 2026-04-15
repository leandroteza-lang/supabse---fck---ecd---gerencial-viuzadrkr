CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  date DATE,
  amount NUMERIC,
  indicator TEXT,
  history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage transactions of own companies" ON public.transactions;
CREATE POLICY "Users can manage transactions of own companies" ON public.transactions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = transactions.company_id AND c.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_transactions_company_account ON public.transactions(company_id, account_id);
