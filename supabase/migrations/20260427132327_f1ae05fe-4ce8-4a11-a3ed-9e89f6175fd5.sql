
-- 1) Restrict public exposure of businesses table
DROP POLICY IF EXISTS "Public can view enabled menu businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public view businesses with active kiosk" ON public.businesses;

-- Public-safe accessor for the digital menu (excludes phone)
CREATE OR REPLACE FUNCTION public.get_public_menu_business(_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  slug text,
  menu_title text,
  menu_description text,
  menu_theme text,
  menu_accent_color text,
  menu_logo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.name, b.address, b.slug, b.menu_title, b.menu_description,
         b.menu_theme, b.menu_accent_color, b.menu_logo_url
  FROM public.businesses b
  WHERE b.slug = _slug AND b.menu_enabled = true
  LIMIT 1;
$$;

-- Public-safe accessor for kiosk (no phone, no address)
CREATE OR REPLACE FUNCTION public.get_public_kiosk_business(_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.name, b.slug
  FROM public.businesses b
  WHERE b.slug = _slug
    AND public.business_has_active_kiosk(b.id)
  LIMIT 1;
$$;

-- 2) Server-validated public kiosk transaction (replaces client-supplied total)
CREATE OR REPLACE FUNCTION public.create_kiosk_transaction(
  _business_id uuid,
  _items jsonb,
  _payment_method text,
  _order_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _settings public.kiosk_settings%ROWTYPE;
  _item jsonb;
  _product_id uuid;
  _qty int;
  _price int;
  _name text;
  _subtotal bigint;
  _total bigint := 0;
  _validated jsonb := '[]'::jsonb;
  _tx_id uuid;
BEGIN
  -- Active kiosk required
  SELECT * INTO _settings FROM public.kiosk_settings
   WHERE business_id = _business_id AND enabled = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kiosk not active for this business';
  END IF;

  -- Payment method must be allowed
  IF _payment_method IS NULL OR NOT (_payment_method = ANY(_settings.payment_methods)) THEN
    RAISE EXCEPTION 'Payment method not allowed';
  END IF;

  -- Order type whitelist
  IF _order_type NOT IN ('kiosk-dinein','kiosk-takeaway') THEN
    RAISE EXCEPTION 'Invalid order type';
  END IF;

  -- Items must be a non-empty array
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Items required';
  END IF;
  IF jsonb_array_length(_items) > 100 THEN
    RAISE EXCEPTION 'Too many items';
  END IF;

  -- Validate each line, recompute prices from products table
  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    _product_id := NULLIF(_item->>'productId','')::uuid;
    _qty := COALESCE((_item->>'qty')::int, 0);

    IF _product_id IS NULL OR _qty <= 0 OR _qty > 999 THEN
      RAISE EXCEPTION 'Invalid item entry';
    END IF;

    SELECT p.price, p.name INTO _price, _name
      FROM public.products p
     WHERE p.id = _product_id AND p.business_id = _business_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found for this business';
    END IF;

    _subtotal := _price::bigint * _qty;
    _total := _total + _subtotal;

    _validated := _validated || jsonb_build_object(
      'productId', _product_id,
      'name', _name,
      'qty', _qty,
      'price', _price,
      'subtotal', _subtotal
    );
  END LOOP;

  IF _total <= 0 OR _total > 2147483647 THEN
    RAISE EXCEPTION 'Invalid total';
  END IF;

  INSERT INTO public.transactions
    (business_id, items, total, discount, payment_method, order_type, status)
  VALUES
    (_business_id, _validated, _total::int, 0, _payment_method, _order_type, 'completed')
  RETURNING id INTO _tx_id;

  RETURN _tx_id;
END;
$$;

-- Remove the permissive public INSERT policy on transactions; RPC bypasses RLS via DEFINER
DROP POLICY IF EXISTS "Public can create transactions for kiosk-active businesses" ON public.transactions;

-- 3) Lock down EXECUTE on SECURITY DEFINER functions
-- Public RPCs that anonymous kiosk visitors must call:
GRANT EXECUTE ON FUNCTION public.get_public_menu_business(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_kiosk_business(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_kiosk_transaction(uuid, jsonb, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_biolink_view(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_has_active_kiosk(uuid) TO anon, authenticated;

-- Owner-only loyalty helpers (self-check auth.uid() inside) - restrict to authenticated
REVOKE EXECUTE ON FUNCTION public.adjust_loyalty_points(uuid, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.award_loyalty_points(uuid, uuid, bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_voucher(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_loyalty_points(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_loyalty_points(uuid, uuid, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_voucher(uuid, uuid) TO authenticated;

-- has_role: only authenticated needs to call it
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
