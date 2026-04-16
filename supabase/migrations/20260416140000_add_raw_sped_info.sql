ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS raw_sped_info JSONB DEFAULT '{}'::jsonb;
