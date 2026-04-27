
-- SECURITY DEFINER helper to break RLS recursion between businesses <-> kiosk_settings
CREATE OR REPLACE FUNCTION public.business_has_active_kiosk(_business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kiosk_settings
    WHERE business_id = _business_id AND enabled = true
  );
$$;

DROP POLICY IF EXISTS "Public view businesses with active kiosk" ON public.businesses;

CREATE POLICY "Public view businesses with active kiosk"
ON public.businesses
FOR SELECT
USING (public.business_has_active_kiosk(id));
