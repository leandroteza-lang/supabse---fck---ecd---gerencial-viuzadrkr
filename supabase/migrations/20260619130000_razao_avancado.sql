-- Razão Avançado: vínculo de lançamento (contrapartida) + RPC de agregados server-side.

-- 1. Coluna que liga as partidas de um mesmo lançamento (I200). Nula nos dados
--    antigos; preenchida a partir de novas (re)importações.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS lancamento_id text;

-- 2. RPC de agregados do razão (corretos independente do que é exibido).
--    SECURITY DEFINER com checagem de propriedade da empresa pelo usuário logado.
CREATE OR REPLACE FUNCTION public.razao_resumo(
  p_company_id uuid,
  p_account_ids uuid[],
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL,
  p_val_min numeric DEFAULT NULL,
  p_val_max numeric DEFAULT NULL,
  p_ind text DEFAULT 'ALL'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = p_company_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado a esta empresa.';
  END IF;

  WITH filt AS MATERIALIZED (
    SELECT t.account_id, t.date, t.amount, t.indicator
    FROM public.transactions t
    WHERE t.company_id = p_company_id
      AND t.account_id = ANY (p_account_ids)
      AND (p_date_from IS NULL OR t.date >= p_date_from)
      AND (p_date_to   IS NULL OR t.date <= p_date_to)
      AND (p_val_min   IS NULL OR t.amount >= p_val_min)
      AND (p_val_max   IS NULL OR t.amount <= p_val_max)
      AND (p_ind = 'ALL' OR t.indicator = p_ind)
  )
  SELECT jsonb_build_object(
    'geral', (
      SELECT jsonb_build_object(
        'debito',  COALESCE(SUM(amount) FILTER (WHERE indicator = 'D'), 0),
        'credito', COALESCE(SUM(amount) FILTER (WHERE indicator = 'C'), 0),
        'qtd',     COUNT(*)
      ) FROM filt
    ),
    'por_conta', (
      SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
        SELECT account_id,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'D'), 0) AS debito,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'C'), 0) AS credito,
          COUNT(*) AS qtd
        FROM filt GROUP BY account_id
      ) x
    ),
    'por_mes', (
      SELECT COALESCE(jsonb_agg(x ORDER BY x.mes), '[]'::jsonb) FROM (
        SELECT to_char(date, 'YYYY-MM') AS mes,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'D'), 0) AS debito,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'C'), 0) AS credito
        FROM filt GROUP BY 1
      ) x
    ),
    'por_dia', (
      SELECT COALESCE(jsonb_agg(x ORDER BY x.dia), '[]'::jsonb) FROM (
        SELECT to_char(date, 'YYYY-MM-DD') AS dia,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'D'), 0) AS debito,
          COALESCE(SUM(amount) FILTER (WHERE indicator = 'C'), 0) AS credito
        FROM filt GROUP BY 1
      ) x
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.razao_resumo(uuid, uuid[], date, date, numeric, numeric, text)
  FROM anon, public;
GRANT EXECUTE ON FUNCTION public.razao_resumo(uuid, uuid[], date, date, numeric, numeric, text)
  TO authenticated;

-- 3. Índice parcial para buscar as partidas de um lançamento (contrapartida).
--    No banco remoto foi criado com CREATE INDEX CONCURRENTLY (tabela grande).
--    Aqui a forma simples basta para ambientes novos.
CREATE INDEX IF NOT EXISTS idx_transactions_company_lcto
  ON public.transactions (company_id, lancamento_id)
  WHERE lancamento_id IS NOT NULL;
