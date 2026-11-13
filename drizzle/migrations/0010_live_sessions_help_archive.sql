ALTER TABLE public.song_requests ADD COLUMN IF NOT EXISTS scheduled_for text CHECK (scheduled_for IN ('this_week','next_week')), ADD COLUMN IF NOT EXISTS played_at timestamptz;
UPDATE public.song_requests SET played_at = updated_at WHERE status = 'played' AND played_at IS NULL;
CREATE TABLE public.live_sessions (code text PRIMARY KEY, title text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, closed_at timestamptz);
GRANT ALL ON public.live_sessions TO service_role;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.help_messages (id bigserial PRIMARY KEY, name text, contact text, message text NOT NULL, page text, created_at timestamptz NOT NULL DEFAULT now(), resolved boolean NOT NULL DEFAULT false);
GRANT ALL ON public.help_messages TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.help_messages_id_seq TO service_role;
ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;