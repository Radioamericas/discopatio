ALTER TABLE public.site_control ADD COLUMN IF NOT EXISTS site_locked boolean NOT NULL DEFAULT false;
ALTER TABLE public.site_control ADD COLUMN IF NOT EXISTS lock_note text;