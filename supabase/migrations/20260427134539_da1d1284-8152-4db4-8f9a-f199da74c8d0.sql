
CREATE TYPE public.queue_status AS ENUM ('waiting','called','served','skipped','cancelled');

CREATE TABLE public.queue_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  welcome_title TEXT NOT NULL DEFAULT 'Ambil Nomor Antrian',
  welcome_subtitle TEXT NOT NULL DEFAULT 'Daftar antrian dari HP Anda, tidak perlu mengantri',
  accent_color TEXT NOT NULL DEFAULT '#2563EB',
  prefix TEXT NOT NULL DEFAULT 'A',
  ask_phone BOOLEAN NOT NULL DEFAULT true,
  ask_party_size BOOLEAN NOT NULL DEFAULT true,
  allow_preorder BOOLEAN NOT NULL DEFAULT false,
  avg_serve_minutes INTEGER NOT NULL DEFAULT 5,
  closed_message TEXT NOT NULL DEFAULT 'Mohon maaf, antrian sedang ditutup.',
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.queue_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view queue settings" ON public.queue_settings
  FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert queue settings" ON public.queue_settings
  FOR INSERT WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update queue settings" ON public.queue_settings
  FOR UPDATE USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete queue settings" ON public.queue_settings
  FOR DELETE USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public view enabled queue" ON public.queue_settings
  FOR SELECT TO anon, authenticated USING (enabled = true);

CREATE TRIGGER update_queue_settings_updated_at
  BEFORE UPDATE ON public.queue_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.queue_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  number TEXT NOT NULL,
  seq INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER,
  note TEXT,
  status public.queue_status NOT NULL DEFAULT 'waiting',
  preorder_transaction_id UUID,
  called_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_queue_tickets_business_status ON public.queue_tickets(business_id, status);
CREATE INDEX idx_queue_tickets_business_created ON public.queue_tickets(business_id, created_at DESC);

ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view queue tickets" ON public.queue_tickets
  FOR SELECT USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update queue tickets" ON public.queue_tickets
  FOR UPDATE USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete queue tickets" ON public.queue_tickets
  FOR DELETE USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public view queue ticket" ON public.queue_tickets
  FOR SELECT TO anon, authenticated USING (
    business_id IN (SELECT business_id FROM public.queue_settings WHERE enabled = true)
  );
CREATE POLICY "Public cancel queue ticket" ON public.queue_tickets
  FOR UPDATE TO anon, authenticated USING (
    business_id IN (SELECT business_id FROM public.queue_settings WHERE enabled = true)
  ) WITH CHECK (
    status = 'cancelled'
  );

CREATE TRIGGER update_queue_tickets_updated_at
  BEFORE UPDATE ON public.queue_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.queue_tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tickets;

CREATE OR REPLACE FUNCTION public.business_has_active_queue(_business_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.queue_settings
    WHERE business_id = _business_id AND enabled = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_public_queue_business(_slug text)
RETURNS TABLE(id uuid, name text, slug text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT b.id, b.name, b.slug
  FROM public.businesses b
  WHERE b.slug = _slug AND public.business_has_active_queue(b.id)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.create_queue_ticket(
  _business_id uuid,
  _name text,
  _phone text DEFAULT NULL,
  _party_size int DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS TABLE(id uuid, number text, queue_position int, eta_minutes int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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
$$;

REVOKE EXECUTE ON FUNCTION public.business_has_active_queue(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_public_queue_business(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_queue_ticket(uuid, text, text, int, text) TO anon, authenticated;
