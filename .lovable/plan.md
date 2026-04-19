
User sudah selesai setup di DOKU dashboard dan ingin lanjut implementasi sekarang. Mereka ingin saya minta input untuk Client ID dan Secret Key.

Plan: implementasi DOKU payment gateway secara minimal-viable dulu. Pakai DOKU Checkout (hosted page) — paling simpel, mirip flow Polar.

Strategi:
1. Minta secrets dulu via add_secret (Client ID, Secret Key, Public Key DOKU, Private Key merchant, Env)
2. Buat 2 edge functions: `create-doku-checkout` (auth required) + `doku-notification` (public webhook)
3. Update `supabase/config.toml` untuk `verify_jwt = false` di doku-notification
4. Update `Pricing.tsx` — tambah tombol kedua untuk DOKU
5. Update `CheckoutSuccess.tsx` untuk handle invoice DOKU

Untuk DOKU Checkout v1: pakai header `Client-Id`, `Request-Id`, `Request-Timestamp`, `Signature` (HMAC-SHA256 base64). Webhook verifikasi pakai signature DOKU di header `Signature`.

Keep plan concise.

## Plan: Implementasi DOKU Payment Gateway

### Step 1: Saya minta 5 secrets via tool
- `DOKU_CLIENT_ID` — Client ID / API Key Anda
- `DOKU_SECRET_KEY` — Secret Key Anda
- `DOKU_PUBLIC_KEY` — DOKU Public Key (untuk verifikasi notifikasi dari DOKU)
- `DOKU_PRIVATE_KEY` — Merchant Private Key yang Anda generate
- `DOKU_ENV` — `sandbox` atau `production`

### Step 2: Edge Functions

**`create-doku-checkout`** (auth required)
- Verifikasi user login (pola sama dengan Polar)
- Generate `invoice_number` unik: `EZPOS-{userId}-{timestamp}`
- Build payload Checkout DOKU (amount Rp 500.000, customer info, success_url, notification_url)
- Sign request: HMAC-SHA256 dengan komponen `Client-Id`, `Request-Id`, `Request-Timestamp`, `Request-Target`, `Digest`
- POST ke endpoint DOKU (sandbox/production sesuai env)
- Return `payment_url` ke client

**`doku-notification`** (PUBLIC, `verify_jwt = false`)
- Terima POST notifikasi pembayaran dari DOKU
- Verifikasi signature dari header (anti-spoofing)
- Parse `invoice_number` → extract `userId`
- Jika status `SUCCESS`: upsert `subscriptions` (plan=`pro`, status=`active`, expires_at=+30 hari) pakai service role
- Return 200 cepat

### Step 3: Update `supabase/config.toml`
Tambah block untuk `doku-notification` dengan `verify_jwt = false`.

### Step 4: Update UI

**`src/pages/Pricing.tsx`**
- Tombol "Upgrade ke Pro" → buka Dialog pilihan metode bayar:
  - **Kartu Internasional (Polar)** — flow existing
  - **VA / E-Wallet / QRIS (DOKU)** — flow baru
- Handler `handleUpgradeDoku()` fetch ke `create-doku-checkout`, redirect ke payment URL

**`src/pages/CheckoutSuccess.tsx`**
- Tambah handle `?invoice=...` (DOKU): tampilkan "Pembayaran sedang diproses, akun aktif dalam 1-2 menit". Webhook yang aktivasi.

### Step 5: Webhook URL untuk didaftarkan di DOKU Dashboard
Setelah deploy, daftarkan URL ini di DOKU dashboard → Notification URL:
```text
https://geepcyqmgracqsvqgeks.supabase.co/functions/v1/doku-notification
```

### Tidak Diubah
- Flow Polar tetap utuh
- Tabel database tidak berubah (pakai `subscriptions` existing)
- `useSubscription` hook tidak berubah
