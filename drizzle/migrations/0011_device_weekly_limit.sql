ALTER TABLE public.request_activity ADD COLUMN IF NOT EXISTS device_id text, ADD COLUMN IF NOT EXISTS ip_week_hash text, ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS request_activity_device_idx ON public.request_activity(device_id, created_at);
CREATE INDEX IF NOT EXISTS request_activity_ipweek_idx ON public.request_activity(ip_week_hash);
ALTER TABLE public.site_control ADD COLUMN IF NOT EXISTS per_device_limit integer NOT NULL DEFAULT 2, ADD COLUMN IF NOT EXISTS alt_open boolean NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS public.blocked_devices (device_id text PRIMARY KEY, note text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.blocked_devices TO service_role;
ALTER TABLE public.blocked_devices ENABLE ROW LEVEL SECURITY;