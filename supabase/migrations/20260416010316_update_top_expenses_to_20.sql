-- Update function to get top 20 expenses dynamically from the database
CREATE OR REPLACE FUNCTION public.get_top_expenses(p_company_id uuid, p_periods text[])
 RETURNS TABLE(account_code text, account_name text, total_value numeric, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_total_expenses NUMERIC;
BEGIN
  -- Calculate total expenses for percentage calculation
  SELECT COALESCE(SUM(ABS(b.debit - b.credit)), 0) INTO v_total_expenses
  FROM balances b
  JOIN accounts a ON a.id = b.account_id
  WHERE a.company_id = p_company_id
    AND a.type = 'A'
    AND (a.code LIKE '4%' OR a.code LIKE '5%')
    AND b.period = ANY(p_periods);

  IF v_total_expenses = 0 THEN
    v_total_expenses := 1; -- Avoid division by zero
  END IF;

  RETURN QUERY
  SELECT 
    a.code AS account_code,
    a.name AS account_name,
    SUM(ABS(b.debit - b.credit)) AS total_value,
    (SUM(ABS(b.debit - b.credit)) / v_total_expenses) * 100 AS percentage
  FROM balances b
  JOIN accounts a ON a.id = b.account_id
  WHERE a.company_id = p_company_id
    AND a.type = 'A'
    AND (a.code LIKE '4%' OR a.code LIKE '5%')
    AND b.period = ANY(p_periods)
  GROUP BY a.code, a.name
  HAVING SUM(ABS(b.debit - b.credit)) > 0
  ORDER BY total_value DESC
  LIMIT 20;
END;
$function$;
