
-- 1) Hide cost_price from public via a view; drop public SELECT on products
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = on) AS
  SELECT p.id, p.business_id, p.name, p.description, p.price, p.category, p.image_url, p.stock, p.created_at, p.updated_at
  FROM public.products p
  WHERE p.business_id IN (SELECT b.id FROM public.businesses b WHERE b.menu_enabled = true)
     OR p.business_id IN (SELECT ks.business_id FROM public.kiosk_settings ks WHERE ks.enabled = true);

GRANT SELECT ON public.products_public TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view products of enabled menu businesses" ON public.products;
DROP POLICY IF EXISTS "Public can view products of kiosk-active businesses" ON public.products;

-- 2) Queue tickets: remove broad public read; expose only via RPC without phone
DROP POLICY IF EXISTS "Public view queue ticket" ON public.queue_tickets;

CREATE OR REPLACE FUNCTION public.get_public_queue_ticket(_id uuid)
RETURNS TABLE(
  id uuid, business_id uuid, number text, seq int, name text,
  party_size int, note text, status queue_status,
  called_at timestamptz, served_at timestamptz, created_at timestamptz, updated_at timestamptz,
  ahead int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _t public.queue_tickets%ROWTYPE; _ahead int;
BEGIN
  SELECT * INTO _t FROM public.queue_tickets WHERE queue_tickets.id = _id;
  IF NOT FOUND THEN RETURN; END IF;
  -- only expose when business has an active queue
  IF NOT public.business_has_active_queue(_t.business_id) THEN RETURN; END IF;

  SELECT COUNT(*) INTO _ahead FROM public.queue_tickets q
   WHERE q.business_id = _t.business_id
     AND q.status IN ('waiting','called')
     AND q.created_at < _t.created_at;

  RETURN QUERY SELECT _t.id, _t.business_id, _t.number, _t.seq, _t.name,
    _t.party_size, _t.note, _t.status, _t.called_at, _t.served_at,
    _t.created_at, _t.updated_at, _ahead;
END $$;

GRANT EXECUTE ON FUNCTION public.get_public_queue_ticket(uuid) TO anon, authenticated;

-- 3) Queue tickets cancel: remove blanket update policy, expose via RPC
DROP POLICY IF EXISTS "Public cancel queue ticket" ON public.queue_tickets;

CREATE OR REPLACE FUNCTION public.cancel_public_queue_ticket(_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _biz uuid; _status queue_status;
BEGIN
  SELECT business_id, status INTO _biz, _status FROM public.queue_tickets WHERE id = _id;
  IF _biz IS NULL THEN RAISE EXCEPTION 'Ticket not found'; END IF;
  IF NOT public.business_has_active_queue(_biz) THEN RAISE EXCEPTION 'Queue not active'; END IF;
  IF _status NOT IN ('waiting','called') THEN RAISE EXCEPTION 'Ticket cannot be cancelled'; END IF;
  UPDATE public.queue_tickets SET status = 'cancelled', updated_at = now() WHERE id = _id;
END $$;

GRANT EXECUTE ON FUNCTION public.cancel_public_queue_ticket(uuid) TO anon, authenticated;

-- 4) Kiosk sessions: remove blanket public update, expose via RPC
DROP POLICY IF EXISTS "Public update kiosk sessions for active kiosk" ON public.kiosk_sessions;

CREATE OR REPLACE FUNCTION public.complete_kiosk_session(
  _id uuid, _transaction_id uuid, _order_type text, _total int
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _biz uuid; _completed timestamptz;
BEGIN
  SELECT business_id, completed_at INTO _biz, _completed FROM public.kiosk_sessions WHERE id = _id;
  IF _biz IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF NOT public.business_has_active_kiosk(_biz) THEN RAISE EXCEPTION 'Kiosk not active'; END IF;
  IF _completed IS NOT NULL THEN RAISE EXCEPTION 'Session already completed'; END IF;
  -- validate transaction belongs to same business
  IF NOT EXISTS (SELECT 1 FROM public.transactions WHERE id = _transaction_id AND business_id = _biz) THEN
    RAISE EXCEPTION 'Invalid transaction';
  END IF;
  IF _order_type NOT IN ('kiosk-dinein','kiosk-takeaway') THEN RAISE EXCEPTION 'Invalid order type'; END IF;
  IF _total < 0 OR _total > 2147483647 THEN RAISE EXCEPTION 'Invalid total'; END IF;

  UPDATE public.kiosk_sessions
     SET completed_at = now(), transaction_id = _transaction_id,
         order_type = _order_type, total = _total
   WHERE id = _id;
END $$;

GRANT EXECUTE ON FUNCTION public.complete_kiosk_session(uuid, uuid, text, int) TO anon, authenticated;

-- 5) Add note length validation in create_queue_ticket
CREATE OR REPLACE FUNCTION public.create_queue_ticket(_business_id uuid, _name text, _phone text DEFAULT NULL::text, _party_size integer DEFAULT NULL::integer, _note text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, number text, queue_position integer, eta_minutes integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _settings public.queue_settings%ROWTYPE;
  _seq int;
  _number text;
  _ticket_id uuid;
  _pos int;
  _eta int;
BEGIN
  SELECT * INTO _settings FROM public.queue_settings
   WHERE business_id = _business_id AND enabled = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Queue not active for this business';
  END IF;

  IF _name IS NULL OR length(trim(_name)) = 0 THEN
    RAISE EXCEPTION 'Name required';
  END IF;
  IF length(_name) > 100 THEN RAISE EXCEPTION 'Name too long'; END IF;
  IF _phone IS NOT NULL AND length(_phone) > 30 THEN RAISE EXCEPTION 'Phone too long'; END IF;
  IF _note IS NOT NULL AND length(_note) > 500 THEN RAISE EXCEPTION 'Note too long'; END IF;
  IF _party_size IS NOT NULL AND (_party_size <= 0 OR _party_size > 99) THEN
    RAISE EXCEPTION 'Invalid party size';
  END IF;

  SELECT COALESCE(MAX(seq), 0) + 1 INTO _seq
    FROM public.queue_tickets
   WHERE business_id = _business_id
     AND created_at >= date_trunc('day', now());

  _number := _settings.prefix || lpad(_seq::text, 3, '0');

  INSERT INTO public.queue_tickets
    (business_id, number, seq, name, phone, party_size, note, status)
  VALUES
    (_business_id, _number, _seq, trim(_name),
     NULLIF(trim(COALESCE(_phone,'')),''),
     _party_size,
     NULLIF(trim(COALESCE(_note,'')),''),
     'waiting')
  RETURNING queue_tickets.id INTO _ticket_id;

  SELECT COUNT(*) INTO _pos
    FROM public.queue_tickets
   WHERE business_id = _business_id
     AND status IN ('waiting','called')
     AND queue_tickets.id <> _ticket_id;

  _eta := _pos * GREATEST(_settings.avg_serve_minutes, 1);

  RETURN QUERY SELECT _ticket_id, _number, _pos, _eta;
END;
$function$;
