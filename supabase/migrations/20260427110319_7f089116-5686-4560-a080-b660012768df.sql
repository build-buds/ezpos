-- ENUMS
CREATE TYPE loyalty_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE loyalty_txn_type AS ENUM ('earn', 'redeem', 'adjust', 'bonus');
CREATE TYPE loyalty_discount_type AS ENUM ('percent', 'fixed');

-- SETTINGS
CREATE TABLE public.loyalty_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  points_per_rupiah NUMERIC(10,4) NOT NULL DEFAULT 0.01,
  point_value_rupiah INTEGER NOT NULL DEFAULT 100,
  min_redeem_points INTEGER NOT NULL DEFAULT 100,
  welcome_bonus INTEGER NOT NULL DEFAULT 0,
  auto_create_member BOOLEAN NOT NULL DEFAULT true,
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MEMBERS
CREATE TABLE public.loyalty_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birthday DATE,
  tier loyalty_tier NOT NULL DEFAULT 'bronze',
  points_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent_rupiah BIGINT NOT NULL DEFAULT 0,
  visit_count INTEGER NOT NULL DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone)
);
CREATE INDEX idx_loyalty_members_business ON public.loyalty_members(business_id);
CREATE INDEX idx_loyalty_members_phone ON public.loyalty_members(business_id, phone);

-- VOUCHERS
CREATE TABLE public.loyalty_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type loyalty_discount_type NOT NULL DEFAULT 'fixed',
  discount_value INTEGER NOT NULL DEFAULT 0,
  points_cost INTEGER NOT NULL DEFAULT 0,
  min_purchase INTEGER NOT NULL DEFAULT 0,
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  valid_until DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_vouchers_business ON public.loyalty_vouchers(business_id);

-- LEDGER
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  type loyalty_txn_type NOT NULL,
  points INTEGER NOT NULL,
  transaction_id UUID,
  voucher_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_txn_member ON public.loyalty_transactions(member_id);
CREATE INDEX idx_loyalty_txn_business ON public.loyalty_transactions(business_id);

-- REDEMPTIONS
CREATE TABLE public.loyalty_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  member_id UUID NOT NULL REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES public.loyalty_vouchers(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  used_at TIMESTAMPTZ,
  transaction_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loyalty_redemptions_member ON public.loyalty_redemptions(member_id);

-- ENABLE RLS
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- HELPER (owner check)
-- Use existing pattern: business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())

-- POLICIES: loyalty_settings
CREATE POLICY "Owners view loyalty settings" ON public.loyalty_settings FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert loyalty settings" ON public.loyalty_settings FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update loyalty settings" ON public.loyalty_settings FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete loyalty settings" ON public.loyalty_settings FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- POLICIES: loyalty_members
CREATE POLICY "Owners view members" ON public.loyalty_members FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert members" ON public.loyalty_members FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update members" ON public.loyalty_members FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete members" ON public.loyalty_members FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- POLICIES: loyalty_vouchers
CREATE POLICY "Owners view vouchers" ON public.loyalty_vouchers FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert vouchers" ON public.loyalty_vouchers FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update vouchers" ON public.loyalty_vouchers FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners delete vouchers" ON public.loyalty_vouchers FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- POLICIES: loyalty_transactions
CREATE POLICY "Owners view loyalty txn" ON public.loyalty_transactions FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert loyalty txn" ON public.loyalty_transactions FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- POLICIES: loyalty_redemptions
CREATE POLICY "Owners view redemptions" ON public.loyalty_redemptions FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners insert redemptions" ON public.loyalty_redemptions FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Owners update redemptions" ON public.loyalty_redemptions FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- TRIGGERS for updated_at
CREATE TRIGGER trg_loyalty_settings_updated BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_members_updated BEFORE UPDATE ON public.loyalty_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_loyalty_vouchers_updated BEFORE UPDATE ON public.loyalty_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tier auto-update function (trigger on members)
CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.total_spent_rupiah >= 5000000 THEN
    NEW.tier := 'gold';
  ELSIF NEW.total_spent_rupiah >= 1000000 THEN
    NEW.tier := 'silver';
  ELSE
    NEW.tier := 'bronze';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_loyalty_tier_update BEFORE INSERT OR UPDATE OF total_spent_rupiah ON public.loyalty_members
  FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_tier();

-- Award loyalty points RPC
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  _member_id UUID,
  _transaction_id UUID,
  _amount BIGINT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id UUID;
  _ratio NUMERIC;
  _points INTEGER;
  _owner UUID;
BEGIN
  SELECT business_id INTO _business_id FROM loyalty_members WHERE id = _member_id;
  IF _business_id IS NULL THEN RAISE EXCEPTION 'Member not found'; END IF;

  -- Authorize: caller must own the business
  SELECT owner_id INTO _owner FROM businesses WHERE id = _business_id;
  IF _owner IS NULL OR _owner <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(points_per_rupiah, 0.01) INTO _ratio FROM loyalty_settings WHERE business_id = _business_id;
  IF _ratio IS NULL THEN _ratio := 0.01; END IF;

  _points := FLOOR(_amount * _ratio)::INTEGER;
  IF _points < 0 THEN _points := 0; END IF;

  UPDATE loyalty_members
    SET points_balance = points_balance + _points,
        total_earned = total_earned + _points,
        total_spent_rupiah = total_spent_rupiah + _amount,
        visit_count = visit_count + 1,
        last_visit_at = now()
  WHERE id = _member_id;

  IF _points > 0 THEN
    INSERT INTO loyalty_transactions (business_id, member_id, type, points, transaction_id, note)
    VALUES (_business_id, _member_id, 'earn', _points, _transaction_id, 'Poin dari transaksi');
  END IF;

  RETURN _points;
END;
$$;

-- Redeem voucher RPC
CREATE OR REPLACE FUNCTION public.redeem_loyalty_voucher(
  _member_id UUID,
  _voucher_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id UUID;
  _v_business UUID;
  _cost INTEGER;
  _balance INTEGER;
  _max INTEGER;
  _count INTEGER;
  _active BOOLEAN;
  _valid DATE;
  _code TEXT;
  _owner UUID;
BEGIN
  SELECT business_id, points_balance INTO _business_id, _balance FROM loyalty_members WHERE id = _member_id;
  IF _business_id IS NULL THEN RAISE EXCEPTION 'Member not found'; END IF;

  SELECT owner_id INTO _owner FROM businesses WHERE id = _business_id;
  IF _owner IS NULL OR _owner <> auth.uid() THEN RAISE EXCEPTION 'Not authorized'; END IF;

  SELECT business_id, points_cost, max_redemptions, redemption_count, active, valid_until
    INTO _v_business, _cost, _max, _count, _active, _valid
    FROM loyalty_vouchers WHERE id = _voucher_id;

  IF _v_business IS NULL OR _v_business <> _business_id THEN RAISE EXCEPTION 'Voucher not found'; END IF;
  IF NOT _active THEN RAISE EXCEPTION 'Voucher tidak aktif'; END IF;
  IF _valid IS NOT NULL AND _valid < CURRENT_DATE THEN RAISE EXCEPTION 'Voucher kadaluarsa'; END IF;
  IF _max IS NOT NULL AND _count >= _max THEN RAISE EXCEPTION 'Voucher sudah habis'; END IF;
  IF _balance < _cost THEN RAISE EXCEPTION 'Poin tidak cukup'; END IF;

  _code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

  UPDATE loyalty_members SET points_balance = points_balance - _cost WHERE id = _member_id;
  UPDATE loyalty_vouchers SET redemption_count = redemption_count + 1 WHERE id = _voucher_id;

  INSERT INTO loyalty_transactions (business_id, member_id, type, points, voucher_id, note)
  VALUES (_business_id, _member_id, 'redeem', -_cost, _voucher_id, 'Tukar voucher');

  INSERT INTO loyalty_redemptions (business_id, member_id, voucher_id, code)
  VALUES (_business_id, _member_id, _voucher_id, _code);

  RETURN _code;
END;
$$;

-- Adjust points RPC (manual)
CREATE OR REPLACE FUNCTION public.adjust_loyalty_points(
  _member_id UUID,
  _delta INTEGER,
  _note TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id UUID;
  _owner UUID;
BEGIN
  SELECT business_id INTO _business_id FROM loyalty_members WHERE id = _member_id;
  IF _business_id IS NULL THEN RAISE EXCEPTION 'Member not found'; END IF;
  SELECT owner_id INTO _owner FROM businesses WHERE id = _business_id;
  IF _owner IS NULL OR _owner <> auth.uid() THEN RAISE EXCEPTION 'Not authorized'; END IF;

  UPDATE loyalty_members
    SET points_balance = GREATEST(0, points_balance + _delta),
        total_earned = CASE WHEN _delta > 0 THEN total_earned + _delta ELSE total_earned END
  WHERE id = _member_id;

  INSERT INTO loyalty_transactions (business_id, member_id, type, points, note)
  VALUES (_business_id, _member_id, 'adjust', _delta, COALESCE(_note, 'Penyesuaian manual'));
END;
$$;