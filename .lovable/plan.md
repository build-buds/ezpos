

## Plan: Integrasi Polar.sh Payment Gateway untuk EZPOS

### Langkah-langkah Implementasi

#### 1. Hubungkan Polar MCP Connector
- Connect Polar MCP ke project agar agent bisa membuat produk dan discount code langsung

#### 2. Simpan POLAR_ACCESS_TOKEN
- User perlu membuat Organization Access Token di Polar dashboard (Settings → Developer → Organization Access Tokens)
- Simpan sebagai secret menggunakan `add_secret` tool

#### 3. Buat Produk di Polar via MCP
- Paket **EZPOS Pro** - Rp 299.000/bulan (recurring monthly)
- Benefit: Feature Flag "Pro Access" untuk gate fitur premium

#### 4. Buat Edge Function `create-polar-checkout`
- Menerima `productId` dan `userId` dari client
- Memanggil Polar API untuk membuat checkout session
- Mengembalikan checkout URL

#### 5. Buat Edge Function `verify-polar-checkout`
- Validasi status checkout (succeeded/failed/expired)
- Update status langganan user di database

#### 6. Migrasi Database
- Tambah tabel `subscriptions` untuk tracking status langganan user (user_id, plan, status, polar_customer_id, expires_at)
- RLS policy: user hanya bisa lihat subscription miliknya

#### 7. Buat Halaman Pricing (`/pricing`)
- 2 card: **Gratis** (outline) dan **Pro Rp 299.000/bln** (highlighted)
- Fitur Gratis: 50 produk, 100 transaksi/bulan, 1 perangkat, laporan dasar
- Fitur Pro: Unlimited produk & transaksi, 3 perangkat, laporan lengkap + export, manajemen stok lanjutan, dukungan prioritas
- Tombol "Upgrade ke Pro" memanggil edge function → redirect ke Polar checkout

#### 8. Buat Halaman Success (`/checkout/success`)
- Validasi checkout via `verify-polar-checkout`
- Tampilkan konfirmasi pembayaran

#### 9. Update Routing & Navigation
- Tambah route `/pricing` dan `/checkout/success` di `App.tsx`
- Tambah link "Langganan" di halaman Settings

#### 10. Buat Discount Code 100% untuk Testing
- Polar tidak punya sandbox mode, jadi buat discount code via MCP untuk testing

### File yang dibuat/diubah
- **Buat**: `supabase/functions/create-polar-checkout/index.ts`
- **Buat**: `supabase/functions/verify-polar-checkout/index.ts`
- **Buat**: `src/pages/Pricing.tsx`
- **Buat**: `src/pages/CheckoutSuccess.tsx`
- **Edit**: `src/App.tsx` (tambah routes)
- **Edit**: `src/pages/Settings.tsx` (tambah link langganan)
- **Migrasi**: Tabel `subscriptions`

