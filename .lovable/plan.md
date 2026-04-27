## Modul Loyalty Programme

Membangun sistem loyalty end-to-end mengikuti panduan IDEKU Loyalty: **Membership Management**, **Points System**, **Voucher System**, dan **Engagement** (broadcast WhatsApp).

---

### 1. Database (Migration)

**`loyalty_settings`** (1 row per business)
- `business_id` (unique), `enabled`, `points_per_rupiah` (default `0.01` → Rp1.000 = 10 poin), `min_redeem_points` (default 100), `point_value_rupiah` (default 100 → 1 poin = Rp100), `welcome_bonus` (default 0), `terms` (text)

**`loyalty_members`**
- `id`, `business_id`, `name`, `phone` (unique per business), `email?`, `birthday?`, `tier` (`bronze`/`silver`/`gold` — auto by total spend), `points_balance`, `total_earned`, `total_spent_rupiah`, `visit_count`, `last_visit_at`, `created_at`

**`loyalty_transactions`** (poin ledger)
- `id`, `member_id`, `business_id`, `type` (`earn`/`redeem`/`adjust`/`bonus`), `points`, `transaction_id?` (FK transactions), `voucher_id?`, `note?`, `created_at`

**`loyalty_vouchers`** (template voucher)
- `id`, `business_id`, `code`, `name`, `description?`, `discount_type` (`percent`/`fixed`), `discount_value`, `points_cost`, `min_purchase`, `max_redemptions?`, `redemption_count` (default 0), `valid_until?`, `active`

**`loyalty_redemptions`** (voucher yang sudah ditukar member)
- `id`, `member_id`, `voucher_id`, `business_id`, `code` (unique 8-char), `redeemed_at`, `used_at?`, `transaction_id?`

**RLS**: Owner-only CRUD untuk semua tabel (pola sama dengan `products`/`biolinks`).

**Functions/Triggers**:
- `award_loyalty_points(_member_id, _transaction_id, _amount)` — SECURITY DEFINER, hitung poin = `floor(amount * points_per_rupiah)`, insert ke `loyalty_transactions`, update `points_balance` & `total_spent_rupiah` & `visit_count`, recalc `tier` (bronze <Rp1jt, silver <Rp5jt, gold ≥Rp5jt).
- `redeem_voucher(_member_id, _voucher_id)` — validasi balance, decrement poin, generate code, insert redemption.

---

### 2. Frontend

**Halaman utama `/loyalty`** (Tabs):
1. **Dashboard** — ringkasan: total member, total poin beredar, voucher aktif, top 5 member, grafik member baru 30 hari.
2. **Members** — list/search by nama/HP, klik buka detail (poin, riwayat earn/redeem, total spent, tier badge). Tombol "Tambah Member" + "Adjust Poin" manual.
3. **Vouchers** — CRUD voucher (nama, tipe diskon, nilai, biaya poin, min purchase, masa berlaku).
4. **Settings** — toggle enable, atur `points_per_rupiah`, `point_value_rupiah`, welcome bonus, terms.

**Integrasi POS** (`src/pages/POS.tsx`):
- Saat checkout: field "No HP Member" (opsional). Jika diisi & cocok → tampilkan badge tier + poin balance + opsi "Pakai Voucher" (dropdown voucher member yang sudah di-redeem).
- Setelah transaksi sukses → panggil `award_loyalty_points` RPC.
- Auto-create member kalau no HP belum terdaftar (toggle di settings).

**Public Member Card** (`/loyalty/card/:phone` — opsional minor, bisa di-skip iterasi ini, **akan dimasukkan di iterasi berikutnya** untuk fokus high-impact dulu).

**Modules hub**:
- Update `src/data/modules.ts`: status Loyalty → `active`, path `/loyalty`.
- Register route `/loyalty` di `src/App.tsx`.

---

### 3. Tier Logic (otomatis via trigger pada update `loyalty_members.total_spent_rupiah`)
- Bronze: < Rp1.000.000
- Silver: Rp1.000.000 – Rp4.999.999
- Gold: ≥ Rp5.000.000

---

### 4. UX & Visual
- Ikuti tema EZPOS: primer `#2563EB`, accent `#D4FF00`, kartu rounded-2xl + card-shadow.
- Tier badge: bronze (amber), silver (slate), gold (yellow accent).
- Empty states ramah dengan ilustrasi ikon.
- Mobile-first dengan `MobileLayout`.

---

### 5. Files

**Created:**
- `supabase/migrations/<ts>_loyalty.sql` — semua tabel, RLS, functions
- `src/pages/Loyalty.tsx` — main dashboard + tabs
- `src/components/loyalty/LoyaltyDashboard.tsx`
- `src/components/loyalty/LoyaltyMembers.tsx`
- `src/components/loyalty/LoyaltyMemberDetail.tsx` (sheet)
- `src/components/loyalty/LoyaltyVouchers.tsx`
- `src/components/loyalty/LoyaltySettings.tsx`
- `src/components/loyalty/MemberLookup.tsx` (dipakai di POS)
- `src/hooks/useLoyalty.ts` — query/mutation hooks

**Edited:**
- `src/App.tsx` — route `/loyalty`
- `src/data/modules.ts` — status active
- `src/pages/POS.tsx` — integrasi member lookup & award poin saat checkout
- `src/integrations/supabase/types.ts` — auto-regen

---

### 6. Out of scope iterasi ini (Coming Soon di tab terpisah)
- Broadcast WhatsApp otomatis (butuh integrasi WA Business API)
- Email campaigns
- Kartu member publik dengan QR scan

Cakupan ini sudah cover **3 dari 4 fitur unggulan IDEKU**: Voucher System, Redeem Points, Customer Membership Management. Automated Campaign ditandai "Segera Hadir" di tab Settings.
