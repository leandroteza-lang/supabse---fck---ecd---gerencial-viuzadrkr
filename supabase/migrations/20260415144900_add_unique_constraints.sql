DO $$
BEGIN
  -- Remove duplicate companies (keep the newest one)
  DELETE FROM public.companies
  WHERE id IN (
      SELECT id
      FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, cnpj ORDER BY created_at DESC) as rn
          FROM public.companies
      ) t
      WHERE t.rn > 1
  );

  -- Add unique constraint to companies
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_user_id_cnpj_key') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_user_id_cnpj_key UNIQUE (user_id, cnpj);
  END IF;

  -- Remove duplicate accounts
  DELETE FROM public.accounts
  WHERE id IN (
      SELECT id
      FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id, code ORDER BY created_at DESC) as rn
          FROM public.accounts
      ) t
      WHERE t.rn > 1
  );

  -- Add unique constraint to accounts
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_company_id_code_key') THEN
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_company_id_code_key UNIQUE (company_id, code);
  END IF;

  -- Remove duplicate balances
  DELETE FROM public.balances
  WHERE id IN (
      SELECT id
      FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY account_id, period ORDER BY id) as rn
          FROM public.balances
      ) t
      WHERE t.rn > 1
  );

  -- Add unique constraint to balances
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'balances_account_id_period_key') THEN
    ALTER TABLE public.balances ADD CONSTRAINT balances_account_id_period_key UNIQUE (account_id, period);
  END IF;
END $$;
