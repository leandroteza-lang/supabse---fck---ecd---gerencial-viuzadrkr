DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'leandro_teza@hotmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'leandro_teza@hotmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Leandro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new_user_id, 'leandro_teza@hotmail.com', 'Leandro')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Fix RLS Policies for main tables (Idempotent)

DROP POLICY IF EXISTS "Users can manage accounts of own companies" ON public.accounts;
CREATE POLICY "Users can manage accounts of own companies" ON public.accounts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.companies WHERE companies.id = accounts.company_id AND companies.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage balances of own companies" ON public.balances;
CREATE POLICY "Users can manage balances of own companies" ON public.balances
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.accounts a JOIN public.companies c ON c.id = a.company_id WHERE a.id = balances.account_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own companies" ON public.companies;
CREATE POLICY "Users can manage own companies" ON public.companies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage transactions of own companies" ON public.transactions;
CREATE POLICY "Users can manage transactions of own companies" ON public.transactions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = transactions.company_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage own configs" ON public.user_configs;
CREATE POLICY "Users can manage own configs" ON public.user_configs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
