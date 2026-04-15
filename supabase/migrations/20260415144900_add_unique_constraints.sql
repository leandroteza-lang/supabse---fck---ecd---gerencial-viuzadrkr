DO $$
BEGIN
  -- Remove duplicate companies (keep the newest one)
  DELETE FROM public.companies a USING (
      SELECT MAX(created_at) as max_date, user_id, cnpj
      FROM public.companies 
      GROUP BY user_id, cnpj HAVING COUNT(*) > 1
  ) b
  WHERE a.user_id = b.user_id AND a.cnpj = b.cnpj AND a.created_at < b.max_date;

  -- Add unique constraint to companies
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'companies_user_id_cnpj_key') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_user_id_cnpj_key UNIQUE (user_id, cnpj);
  END IF;

  -- Remove duplicate accounts
  DELETE FROM public.accounts a USING (
      SELECT MAX(created_at) as max_date, company_id, code
      FROM public.accounts 
      GROUP BY company_id, code HAVING COUNT(*) > 1
  ) b
  WHERE a.company_id = b.company_id AND a.code = b.code AND a.created_at < b.max_date;

  -- Add unique constraint to accounts
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_company_id_code_key') THEN
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_company_id_code_key UNIQUE (company_id, code);
  END IF;

  -- Remove duplicate balances
  DELETE FROM public.balances a USING (
      SELECT MAX(id) as max_id, account_id, period
      FROM public.balances 
      GROUP BY account_id, period HAVING COUNT(*) > 1
  ) b
  WHERE a.account_id = b.account_id AND a.period = b.period AND a.id < b.max_id;

  -- Add unique constraint to balances
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'balances_account_id_period_key') THEN
    ALTER TABLE public.balances ADD CONSTRAINT balances_account_id_period_key UNIQUE (account_id, period);
  END IF;
END $$;
