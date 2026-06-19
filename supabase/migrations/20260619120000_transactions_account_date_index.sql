-- Índice para acelerar o Razão Contábil.
-- A tabela public.transactions tem milhões de linhas. O razão consulta por
-- empresa + conta + intervalo de datas, ordenado por data. Sem um índice que
-- inclua a coluna `date`, a consulta fazia varredura/ordenação cara e expirava,
-- fazendo o razão "não gerar".
--
-- No banco remoto este índice já foi criado com CREATE INDEX CONCURRENTLY
-- (tabela grande, para não travar escrita). Aqui usamos a forma simples, que é
-- instantânea em ambientes novos (tabela vazia). O IF NOT EXISTS torna a
-- aplicação idempotente.
CREATE INDEX IF NOT EXISTS idx_transactions_company_account_date
  ON public.transactions (company_id, account_id, date);
