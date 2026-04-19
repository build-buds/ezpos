
User ingin reset integrasi DOKU dan mulai ulang khusus untuk sandbox. Saya perlu hapus implementasi DOKU saat ini dan setup ulang dengan fokus sandbox.

Yang ada sekarang:
- 2 edge functions: create-doku-checkout, doku-notification
- 5 secrets DOKU sudah terset
- UI: Pricing dialog 2 metode bayar, CheckoutSuccess polling
- supabase/config.toml block doku-notification

Strategi reset: hapus semua DOKU code, lalu rebuild bersih dengan fokus sandbox-only. Hardcode endpoint sandbox, simplify, dan dokumentasi sandbox-spesifik.

## Plan: Reset & Setup Ulang DOKU (Sandbox-Only)

### Step 1: Hapus Integrasi DOKU Lama
- Hapus folder `supabase/functions/create-doku-checkout/`
- Hapus folder `supabase/functions/doku-notification/`
- Hapus block `[functions.doku-notification]` di `supabase/config.toml`
- Revert `Pricing.tsx`: hapus dialog pilihan metode, kembali ke 1 tombol Polar saja
- Revert `CheckoutSuccess.tsx`: hapus polling DOKU
- Hapus secrets via tool: `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_PUBLIC_KEY`, `DOKU_PRIVATE_KEY`, `DOKU_ENV`

### Step 2: Konfirmasi Kredensial Sandbox Baru
Saya minta ulang **3 secrets sandbox saja** (lebih simpel — `DOKU_PRIVATE_KEY` & `DOKU_ENV` tidak perlu lagi karena hardcode sandbox):
- `DOKU_CLIENT_ID` — dari DOKU **sandbox** dashboard
- `DOKU_SECRET_KEY` — dari DOKU **sandbox** dashboard
- `DOKU_PUBLIC_KEY` — DOKU sandbox public key (untuk verifikasi webhook)

### Step 3: Bangun Ulang Edge Functions (Sandbox-Hardcoded)

**`create-doku-checkout`** (auth required)
- Hardcode `baseUrl = "https://api-sandbox.doku.com"`
- Tetap pakai DOKU Checkout API v1 dengan signature HMAC-SHA256
- Generate invoice: `EZPOS-{userIdPrefix}-{timestamp}`
- Return payment URL ke client

**`doku-notification`** (public webhook, `verify_jwt = false`)
- Verifikasi signature DOKU dari header
- Parse invoice → temukan user → upsert subscription jadi Pro 30 hari
- Logging detail untuk memudahkan debug sandbox

### Step 4: Update UI

**`Pricing.tsx`**
- Tambah lagi Dialog pilih metode bayar (Polar vs DOKU)
- Tandai DOKU dengan badge **"Sandbox"** kuning supaya jelas mode test

**`CheckoutSuccess.tsx`**
- Polling subscription status setelah redirect dari DOKU

### Step 5: Panduan Setup Sandbox (Setelah Implementasi)

Saya akan beri panduan lengkap:
1. Login https://sandbox.doku.com
2. Daftarkan webhook URL: `https://geepcyqmgracqsvqgeks.supabase.co/functions/v1/doku-notification`
3. Test transaksi pakai VA dummy sandbox
4. Cek logs `doku-notification`

### Tidak Diubah
- Polar tetap utuh (bisa test tetap berfungsi)
- Tabel `subscriptions` tetap sama
- Hooks & state management tidak berubah

### Catatan
Setelah Anda approve, saya akan:
1. Hapus kode DOKU lama
2. Hapus 5 secret DOKU lama  
3. Minta 3 secret sandbox baru via tool
4. Build ulang edge functions + UI
