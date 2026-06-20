-- Correção de duplicação na importação.
-- A importação apaga o período antes de reinserir. O DELETE por intervalo de
-- data expirava (sem índice por (company_id, date) na tabela enorme), então
-- cada reimportação SOMAVA cópias em vez de substituir. Aqui:
--   1) índice (company_id, date) para o DELETE por período ser rápido;
--   2) RPC de limpeza em lotes (chamada em loop pelo import).

-- 1. Índice (no remoto criado com CREATE INDEX CONCURRENTLY; aqui a forma simples).
CREATE INDEX IF NOT EXISTS idx_transactions_company_date
  ON public.transactions (company_id, date);

-- 2. Limpeza confiável de um período, em lotes (até p_limit linhas por chamada).
CREATE OR REPLACE FUNCTION public.purge_transactions_range(
  p_company_id uuid,
  p_date_from date,
  p_date_to date,
  p_limit int DEFAULT 200000
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = p_company_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado a esta empresa.';
  END IF;

  DELETE FROM public.transactions
  WHERE ctid = ANY (ARRAY(
    SELECT ctid FROM public.transactions
    WHERE company_id = p_company_id
      AND date >= p_date_from
      AND date <= p_date_to
    LIMIT p_limit
  ));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

REVOKE EXECUTE ON FUNCTION public.purge_transactions_range(uuid, date, date, int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.purge_transactions_range(uuid, date, date, int) TO authenticated;
