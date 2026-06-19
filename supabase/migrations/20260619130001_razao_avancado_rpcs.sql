-- Linhas do razão (paginadas, com código/nome da conta) e contrapartidas.
-- Via RPC (POST) para evitar limites de URL com muitas contas/ids.

CREATE OR REPLACE FUNCTION public.razao_lancamentos(
  p_company_id uuid,
  p_account_ids uuid[],
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_val_min numeric DEFAULT NULL,
  p_val_max numeric DEFAULT NULL,
  p_ind text DEFAULT 'ALL',
  p_limit int DEFAULT 500,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  account_id uuid, code text, name text, dt date,
  amount numeric, indicator text, history text, lancamento_id text
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.id = p_company_id AND c.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado a esta empresa.';
  END IF;
  RETURN QUERY
  SELECT t.account_id, a.code, a.name, t.date, t.amount, t.indicator, t.history, t.lancamento_id
  FROM public.transactions t
  JOIN public.accounts a ON a.id = t.account_id
  WHERE t.company_id = p_company_id
    AND t.account_id = ANY (p_account_ids)
    AND (p_date_from IS NULL OR t.date >= p_date_from)
    AND (p_date_to   IS NULL OR t.date <= p_date_to)
    AND (p_val_min   IS NULL OR t.amount >= p_val_min)
    AND (p_val_max   IS NULL OR t.amount <= p_val_max)
    AND (p_ind = 'ALL' OR t.indicator = p_ind)
  ORDER BY t.account_id, t.date, t.id
  LIMIT p_limit OFFSET p_offset;
END $$;

REVOKE EXECUTE ON FUNCTION public.razao_lancamentos(uuid, uuid[], date, date, numeric, numeric, text, int, int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.razao_lancamentos(uuid, uuid[], date, date, numeric, numeric, text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.razao_contrapartidas(
  p_company_id uuid,
  p_lancamento_ids text[]
)
RETURNS TABLE (
  lancamento_id text, account_id uuid, code text, name text, amount numeric, indicator text
)
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.id = p_company_id AND c.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado a esta empresa.';
  END IF;
  RETURN QUERY
  SELECT t.lancamento_id, t.account_id, a.code, a.name, t.amount, t.indicator
  FROM public.transactions t
  JOIN public.accounts a ON a.id = t.account_id
  WHERE t.company_id = p_company_id
    AND t.lancamento_id = ANY (p_lancamento_ids);
END $$;

REVOKE EXECUTE ON FUNCTION public.razao_contrapartidas(uuid, text[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.razao_contrapartidas(uuid, text[]) TO authenticated;
