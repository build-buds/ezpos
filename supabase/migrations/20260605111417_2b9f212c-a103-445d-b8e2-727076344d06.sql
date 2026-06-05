-- Create SECURITY DEFINER RPC for starting a kiosk session safely.
CREATE OR REPLACE FUNCTION public.start_kiosk_session(_business_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _id uuid;
BEGIN
  IF _business_id IS NULL THEN
    RAISE EXCEPTION 'business_id required';
  END IF;
  IF NOT public.business_has_active_kiosk(_business_id) THEN
    RAISE EXCEPTION 'Kiosk not active for this business';
  END IF;

  INSERT INTO public.kiosk_sessions (business_id)
  VALUES (_business_id)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_kiosk_session(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_kiosk_session(uuid) TO anon, authenticated;

-- Remove the broad anon/authenticated INSERT policy; sessions now flow through the RPC only.
DROP POLICY IF EXISTS "Public insert kiosk sessions for active kiosk" ON public.kiosk_sessions;
