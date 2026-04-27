-- Create biolinks table
CREATE TABLE public.biolinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'classic',
  accent_color TEXT NOT NULL DEFAULT '#2563EB',
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_biolinks_business_id ON public.biolinks(business_id);
CREATE INDEX idx_biolinks_slug ON public.biolinks(slug);

ALTER TABLE public.biolinks ENABLE ROW LEVEL SECURITY;

-- Owner CRUD policies
CREATE POLICY "Owners can view own biolinks"
ON public.biolinks FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can create biolinks for own business"
ON public.biolinks FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can update own biolinks"
ON public.biolinks FOR UPDATE
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete own biolinks"
ON public.biolinks FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- Public can view enabled biolinks
CREATE POLICY "Public can view enabled biolinks"
ON public.biolinks FOR SELECT
TO anon, authenticated
USING (enabled = true);

-- updated_at trigger
CREATE TRIGGER update_biolinks_updated_at
BEFORE UPDATE ON public.biolinks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Secure RPC to increment view count without granting UPDATE to anon
CREATE OR REPLACE FUNCTION public.increment_biolink_view(_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.biolinks
  SET view_count = view_count + 1
  WHERE slug = _slug AND enabled = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_biolink_view(TEXT) TO anon, authenticated;