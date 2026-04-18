-- Ceremony reveal control: extend settings table.
-- Apply via Supabase SQL editor on project lslgavkqxhivoofrvfxy (or wherever production lives).

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS results_revealed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ;

-- Backfill: ensure the single settings row exists. (No-op if it already does.)
INSERT INTO public.settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- RLS: anyone may read settings; only admins may toggle the reveal flag.
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_admin_write" ON public.settings;
CREATE POLICY "settings_admin_write"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Once revealed, prevent un-reveal at the database layer (defense in depth; admin UI also blocks this).
CREATE OR REPLACE FUNCTION public.prevent_results_unreveal()
  RETURNS TRIGGER
  LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.results_revealed = true AND NEW.results_revealed = false THEN
    RAISE EXCEPTION 'Results cannot be un-revealed once made public';
  END IF;
  -- Stamp revealed_at automatically on transition false -> true.
  IF OLD.results_revealed = false AND NEW.results_revealed = true AND NEW.revealed_at IS NULL THEN
    NEW.revealed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS settings_prevent_unreveal ON public.settings;
CREATE TRIGGER settings_prevent_unreveal
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_results_unreveal();

-- Enable Realtime publication on settings so the frontend can subscribe to reveal flips.
-- (Idempotent: ignore error if already in publication.)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
