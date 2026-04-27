-- Kiosk Settings
CREATE TABLE public.kiosk_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  welcome_title TEXT NOT NULL DEFAULT 'Selamat Datang',
  welcome_subtitle TEXT NOT NULL DEFAULT 'Pesan dengan mudah, cepat, dan akurat',
  accent_color TEXT NOT NULL DEFAULT '#2563EB',
  idle_timeout_seconds INTEGER NOT NULL DEFAULT 60,
  ask_order_type BOOLEAN NOT NULL DEFAULT true,
  ask_loyalty BOOLEAN NOT NULL DEFAULT true,
  payment_methods TEXT[] NOT NULL DEFAULT ARRAY['cash','qris']::text[],
  success_message TEXT NOT NULL DEFAULT 'Terima kasih! Pesanan Anda sedang disiapkan.',
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kiosk_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view kiosk settings" ON public.kiosk_settings FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert kiosk settings" ON public.kiosk_settings FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update kiosk settings" ON public.kiosk_settings FOR UPDATE
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete kiosk settings" ON public.kiosk_settings FOR DELETE
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public view enabled kiosk" ON public.kiosk_settings FOR SELECT
  TO anon, authenticated
  USING (enabled = true);

CREATE TRIGGER trg_kiosk_settings_updated
  BEFORE UPDATE ON public.kiosk_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Kiosk Sessions
CREATE TABLE public.kiosk_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  transaction_id UUID,
  order_type TEXT,
  total INTEGER
);

ALTER TABLE public.kiosk_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view kiosk sessions" ON public.kiosk_sessions FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Public insert kiosk sessions for active kiosk" ON public.kiosk_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (business_id IN (SELECT business_id FROM public.kiosk_settings WHERE enabled = true));
CREATE POLICY "Public update kiosk sessions for active kiosk" ON public.kiosk_sessions FOR UPDATE
  TO anon, authenticated
  USING (business_id IN (SELECT business_id FROM public.kiosk_settings WHERE enabled = true));

CREATE INDEX idx_kiosk_sessions_business_started ON public.kiosk_sessions(business_id, started_at DESC);

-- Public access to products for active kiosk
CREATE POLICY "Public can view products of kiosk-active businesses" ON public.products FOR SELECT
  TO anon, authenticated
  USING (business_id IN (SELECT business_id FROM public.kiosk_settings WHERE enabled = true));

-- Public can create transactions for kiosk-active businesses
CREATE POLICY "Public can create transactions for kiosk-active businesses" ON public.transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (business_id IN (SELECT business_id FROM public.kiosk_settings WHERE enabled = true));

-- Public can view businesses that have an active kiosk (so kiosk page can fetch business name/slug)
CREATE POLICY "Public view businesses with active kiosk" ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (id IN (SELECT business_id FROM public.kiosk_settings WHERE enabled = true));