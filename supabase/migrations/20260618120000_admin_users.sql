-- Admin de usuários: marca de admin em profiles, helper is_admin() e
-- trigger que cria profiles automaticamente para qualquer novo auth.users.

-- 1. Coluna que marca quem é admin (default false)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Marca o dono como admin (idempotente)
UPDATE public.profiles
  SET is_admin = true
  WHERE email = 'leandro_teza@hotmail.com';

-- 3. Helper SECURITY DEFINER: lê profiles ignorando RLS, evita recursão de policy
--    e serve de gate de autorização na Edge Function.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = uid), false);
$$;

-- 4. Trigger: cria a linha em public.profiles para qualquer novo usuário
--    (cobre tanto o cadastro público quanto a criação via painel admin).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Endurecimento: estas funções SECURITY DEFINER não devem ser chamáveis via
--    RPC (/rest/v1/rpc/...). handle_new_user roda apenas pelo trigger; is_admin
--    é usada server-side. Revoga o EXECUTE concedido por padrão ao PUBLIC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated, public;
