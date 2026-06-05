
-- 1. Stop broadcasting queue_tickets (contains phone numbers) via Realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.queue_tickets;

-- 2. Drop overly broad public SELECT policies
DROP POLICY IF EXISTS "Public can view enabled biolinks" ON public.biolinks;
DROP POLICY IF EXISTS "Public view enabled kiosk" ON public.kiosk_settings;
DROP POLICY IF EXISTS "Public view enabled queue" ON public.queue_settings;

-- 3. Provide scoped SECURITY DEFINER RPCs for public access
CREATE OR REPLACE FUNCTION public.get_public_biolink(_slug text)
RETURNS TABLE(id uuid, business_id uuid, slug text, display_name text, bio text, avatar_url text, theme text, accent_color text, links jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, business_id, slug, display_name, bio, avatar_url, theme, accent_color, links
  FROM public.biolinks
  WHERE slug = _slug AND enabled = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_kiosk_settings(_business_id uuid)
RETURNS SETOF public.kiosk_settings
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.kiosk_settings
  WHERE business_id = _business_id AND enabled = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_queue_settings(_business_id uuid)
RETURNS SETOF public.queue_settings
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.queue_settings
  WHERE business_id = _business_id AND enabled = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_biolink(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_kiosk_settings(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_queue_settings(uuid) TO anon, authenticated;
