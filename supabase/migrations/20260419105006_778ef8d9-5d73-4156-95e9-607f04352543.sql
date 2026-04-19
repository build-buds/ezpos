-- Add menu digital columns to businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS menu_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS menu_title TEXT,
  ADD COLUMN IF NOT EXISTS menu_description TEXT,
  ADD COLUMN IF NOT EXISTS menu_theme TEXT NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS menu_accent_color TEXT NOT NULL DEFAULT '#2563EB',
  ADD COLUMN IF NOT EXISTS menu_logo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);

-- Public read access (anon + authenticated) when menu_enabled = true
CREATE POLICY "Public can view enabled menu businesses"
ON public.businesses
FOR SELECT
TO anon, authenticated
USING (menu_enabled = true);

CREATE POLICY "Public can view products of enabled menu businesses"
ON public.products
FOR SELECT
TO anon, authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE menu_enabled = true
  )
);

-- Backfill slugs for existing businesses
UPDATE public.businesses
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;