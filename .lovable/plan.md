

# Plan: Real Data dengan Supabase + Storage + Persiapan Publish

## Ringkasan

Migrasi EZPOS dari data simulasi (localStorage + sample data) ke Supabase backend yang nyata menggunakan Lovable Cloud. Ini mencakup autentikasi real, database untuk produk & transaksi, storage untuk gambar produk, dan persiapan publish.

## Arsitektur

```text
Auth (Supabase Auth)  →  Database (products, transactions, businesses)
                       →  Storage (product-images bucket)
                       →  RLS policies per business
```

## Langkah Implementasi

### 1. Setup Lovable Cloud & Supabase
- Enable Lovable Cloud (Supabase) untuk project ini
- Setup autentikasi email + Google sign-in

### 2. Database Schema (Migrasi SQL)
Buat tabel-tabel berikut:

- **businesses** — id, owner_id (auth.users), name, category, created_at
- **products** — id, business_id, name, description, price, cost_price, image_url, category, stock, min_stock, created_at
- **transactions** — id, business_id, items (jsonb), total, discount, payment_method, order_type, status, created_at
- **user_roles** — id, user_id, role (enum: admin, staff)

Semua tabel dengan RLS aktif, scoped ke business_id milik user.

### 3. Storage Bucket
- Buat bucket `product-images` (public) untuk foto produk
- RLS policy: authenticated users bisa upload/read

### 4. Migrasi Auth (Auth.tsx)
- Ganti login/register simulasi → `supabase.auth.signInWithPassword()` dan `supabase.auth.signUp()`
- Ganti Google simulasi → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Update AppContext untuk menggunakan `supabase.auth.onAuthStateChange()`

### 5. Migrasi Data Layer
- **Products**: Ganti `SAMPLE_PRODUCTS` dengan query ke tabel `products` via Supabase
- **Transactions**: Simpan transaksi POS ke tabel `transactions`
- **Dashboard**: Query real data (omzet hari ini, jumlah transaksi) dari `transactions`
- **Reports**: Query agregasi dari `transactions` berdasarkan periode

### 6. Upload Gambar Produk
- Update form tambah/edit produk di Products.tsx untuk upload ke Supabase Storage
- Simpan public URL ke kolom `image_url` di tabel products

### 7. Onboarding → Create Business Record
- Saat onboarding selesai, insert ke tabel `businesses`
- Simpan business_id di context untuk semua query selanjutnya

### 8. Persiapan Publish
- Set publish visibility ke public
- Pastikan semua route handle auth state (redirect ke /auth jika belum login)

## File yang Dibuat/Diubah

- `supabase/migrations/001_initial_schema.sql` — schema lengkap
- `supabase/migrations/002_storage.sql` — bucket + RLS
- `src/integrations/supabase/client.ts` — Supabase client (auto-generated)
- `src/contexts/AppContext.tsx` — migrasi ke Supabase auth + data
- `src/pages/Auth.tsx` — real Supabase auth
- `src/pages/Products.tsx` — CRUD via Supabase + image upload
- `src/pages/POS.tsx` — simpan transaksi ke DB
- `src/pages/Dashboard.tsx` — query real data
- `src/pages/Reports.tsx` — query agregasi
- `src/pages/OnboardingSetup.tsx` — insert business record
- `src/hooks/useProducts.ts` — hook baru untuk query products
- `src/hooks/useTransactions.ts` — hook baru untuk query transactions

## Detail Teknis

- Menggunakan `@tanstack/react-query` (sudah terinstall) untuk data fetching
- RLS memastikan setiap user hanya akses data bisnis miliknya
- Storage bucket public agar gambar produk bisa diakses tanpa auth
- Auth state di-manage via `onAuthStateChange` listener

