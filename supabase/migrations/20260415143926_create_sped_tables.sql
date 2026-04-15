-- Seed initial user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      '{"name": "Leandro Teza"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;
END $$;

-- Create core tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  level INTEGER,
  nature TEXT,
  parent_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  initial_balance NUMERIC,
  initial_indicator TEXT,
  debit NUMERIC,
  credit NUMERIC,
  final_balance NUMERIC,
  final_indicator TEXT
);

CREATE TABLE IF NOT EXISTS public.user_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed profile for user
DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  SELECT id INTO seed_user_id FROM auth.users WHERE email = 'leandro_teza@hotmail.com' LIMIT 1;
  IF seed_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (seed_user_id, 'leandro_teza@hotmail.com', 'Leandro Teza')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Setup RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own companies" ON public.companies;
CREATE POLICY "Users can manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage accounts of own companies" ON public.accounts;
CREATE POLICY "Users can manage accounts of own companies" ON public.accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = accounts.company_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage balances of own companies" ON public.balances;
CREATE POLICY "Users can manage balances of own companies" ON public.balances FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    JOIN public.companies c ON c.id = a.company_id
    WHERE a.id = balances.account_id AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage own configs" ON public.user_configs;
CREATE POLICY "Users can manage own configs" ON public.user_configs FOR ALL USING (auth.uid() = user_id);
