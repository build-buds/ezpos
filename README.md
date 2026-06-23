# EZPOS — Kasir Restoran & Manajemen F&B

EZPOS adalah **platform SaaS multi-tenant** untuk pemilik bisnis F&B di Indonesia
(restoran, kafe, warung makan, food stall) yang ingin menjalankan operasional
harian — kasir, menu digital, antrian, loyalti, laporan — dari satu aplikasi
web yang mobile-first dan bisa berjalan offline (PWA).

> Bukan aplikasi internal untuk satu bisnis. Setiap pemilik bisnis yang
> mendaftar mendapat *workspace* (business) terisolasi dengan data, staf,
> produk, dan transaksi sendiri.

---

## 1. Logika Dasar Platform

### 1.1 Model Multi-Tenant

Setiap akun yang mendaftar berperan sebagai **owner** dari satu atau lebih
`businesses`. Semua entitas operasional (produk, transaksi, pelanggan,
notifikasi, dsb.) **wajib** memiliki kolom `business_id` sebagai *tenant key*.

```text
auth.users (Supabase Auth)
   └── profiles (1:1)            ← data user
        └── businesses (1:N)     ← workspace / tenant
             ├── products
             ├── categories
             ├── transactions ──── transaction_items
             ├── customers / loyalty
             ├── queues
             ├── biolinks / kiosk_sessions
             ├── notifications
             └── business_members (staf + role)
```

**Aturan emas (tidak boleh dilanggar):**

1. Setiap tabel domain harus punya kolom `business_id uuid not null`
   yang mereferensi `public.businesses(id) on delete cascade`.
2. Setiap tabel domain **wajib** `enable row level security` + policy yang
   memfilter berdasarkan `business_id` milik user (lewat fungsi
   `public.user_has_business_access(business_id)` atau `has_role`).
3. Setiap query dari client harus secara implisit/explisit ter-scope ke
   `currentBusinessId` dari `AppContext`. Jangan pernah query tanpa filter
   `business_id`.
4. Role disimpan di tabel terpisah (`user_roles`, `business_members`) —
   **tidak pernah** di `profiles`.
5. Edge Function yang menulis ke tabel domain wajib memverifikasi token
   user (`supabase.auth.getUser(accessToken)`) lalu memvalidasi bahwa user
   tersebut adalah member dari `business_id` yang dikirim.

### 1.2 Siklus Hidup Tenant

```text
Sign up ──► Splash (verifikasi sesi) ──► Onboarding kategori ──►
Onboarding setup (nama bisnis, lokasi, logo) ──► businesses row dibuat ──►
currentBusinessId disimpan ──► Home/Dashboard
```

- Sebelum `businesses` ada, user **hanya** boleh akses route onboarding.
- `ProtectedRoute` menunggu `isBusinessDataLoaded = true` sebelum render
  modul apa pun untuk mencegah query dengan `business_id` undefined.

### 1.3 Paket Berlangganan (Freemium + Pro)

| Batasan          | Free                   | EZPOS Pro (Rp 299k/bln) |
| ---------------- | ---------------------- | ----------------------- |
| Produk           | 50                     | Tak terbatas            |
| Transaksi / bln  | 100                    | Tak terbatas            |
| Laporan          | Hanya "Hari ini"       | Semua rentang waktu     |
| Modul lanjutan   | Terbatas               | Penuh (KDS, dst.)       |

Status langganan dikelola via **Polar.sh** dan dicek server-side melalui
kolom `subscription_status` / `subscription_expires_at` di `businesses`.
Limit hard-check dilakukan di Edge Function, soft-check di UI.

---

## 2. Arsitektur Teknis

- **Frontend:** React 18 + Vite 5 + TypeScript 5
- **Styling:** Tailwind CSS v3 + shadcn/ui (token semantik di `index.css`)
- **State:** `AppContext` (user, business saat ini, profile) +
  `localStorage` untuk persistensi onboarding & preferensi
- **Backend:** Lovable Cloud (Supabase) — Postgres, Auth, Storage, Realtime,
  Edge Functions
- **Notifikasi:** `sonner` (toast) + tabel `notifications` + Web Push
- **PWA:** service worker dengan fallback `offline.html`
- **Pembayaran:** Polar.sh untuk langganan
- **Analytics:** helper di `src/lib/analytics.ts`

### Struktur Folder Utama

```text
src/
 ├── pages/             ← satu file per route
 ├── components/        ← UI reusable (ui/ = shadcn, fitur per folder)
 ├── contexts/          ← AppContext, dst.
 ├── hooks/             ← useAuth, useBusiness, dsb.
 ├── integrations/
 │    └── supabase/     ← AUTO-GENERATED, jangan diedit
 ├── lib/               ← analytics, utils, validators
 └── data/              ← konten statis (blog, dsb.)
supabase/
 ├── migrations/        ← SQL berurutan, satu arah
 └── functions/         ← Edge Functions (Deno)
```

---

## 3. Modul & Konsistensi Antar-Fitur

Setiap modul **wajib** mengikuti kontrak berikut agar konsisten di seluruh
platform multi-tenant:

| Kontrak                         | Implementasi                                          |
| ------------------------------- | ----------------------------------------------------- |
| Tenant-scoping                  | Semua query/mutasi filter `business_id`               |
| RLS                             | Policy `business_id = ... AND user_has_access(...)`   |
| GRANT                           | `GRANT ... TO authenticated; GRANT ALL TO service_role` |
| Auth guard                      | `<ProtectedRoute>` untuk route privat                 |
| Loading guard                   | Cek `isBusinessDataLoaded` sebelum render             |
| Layout mobile                   | `MobileLayout` + `BottomNav`                          |
| Layout desktop                  | `DesktopSidebar` + header full-width                  |
| Notifikasi sukses/gagal         | `sonner` (`toast.success` / `toast.error`)            |
| Warna                           | Token semantik (jangan hardcode hex / text-white)     |
| Tombol form                     | Statis di bawah, full-width di mobile                 |
| Limit paket                     | Cek `subscription_status` sebelum aksi premium        |
| SEO (route publik)              | Komponen `<SEO />` + JSON-LD jika perlu               |
| Halaman publik tenant           | URL pakai `slug` bisnis, bukan UUID                   |

### Modul yang Sudah Ada

- **POS** — kasir mobile-first, simpan transaksi + items.
- **Products** — CRUD produk + kategori, kompresi gambar <500KB.
- **Reports** — analitik realtime per `business_id`.
- **Queue** — sistem antrian + halaman publik `/q/:slug`.
- **Biolink** — landing page tenant `/b/:slug`.
- **Kiosk** — self-order kiosk `/k/:slug`.
- **Menu publik** — `/m/:slug`.
- **Loyalty** — poin pelanggan per tenant.
- **Settings** — profil bisnis, staf, langganan, paket.
- **Notifications** — in-app + Web Push (insert hanya via trigger / Edge Function).
- **Admin** — dashboard internal Lovable (role `admin`), bukan untuk tenant.

### Halaman Publik vs Privat

- **Publik (noIndex per tenant kecuali landing):** `/`, `/blog`, `/pricing`,
  `/contact`, `/terms`, `/privacy`, `/m/:slug`, `/q/:slug`, `/k/:slug`,
  `/b/:slug`.
- **Privat (butuh auth + business):** `/home`, `/pos`, `/products`,
  `/reports`, `/queue`, `/loyalty`, `/settings`, `/modules`.
- **Onboarding:** `/splash`, `/auth`, `/onboarding`, `/onboarding/setup`.

---

## 4. Checklist Saat Menambah Modul Baru

Sebelum PR/commit modul baru dianggap selesai:

- [ ] Tabel baru punya `business_id` + FK cascade ke `businesses`.
- [ ] Migrasi memuat: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`.
- [ ] Policy memfilter berdasarkan `business_id` user yang sedang login.
- [ ] Query client memakai `currentBusinessId` dari `AppContext`.
- [ ] Edge Function (jika ada) verifikasi token + keanggotaan business.
- [ ] Tidak ada insert ke `notifications` dari client (pakai trigger / function).
- [ ] Route privat dibungkus `<ProtectedRoute>`; publik pakai slug bisnis.
- [ ] Limit paket (Free vs Pro) divalidasi server-side.
- [ ] UI pakai token warna (`bg-primary`, `text-foreground`, dst.), bukan hex.
- [ ] Toast pakai `sonner`.
- [ ] Mobile: `BottomNav` + form button statis di bawah.
- [ ] Jika route publik baru: tambahkan ke `scripts/generate-sitemap.ts` &
      `<SEO />`.

---

## 5. Pengembangan Lokal

```bash
npm install
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint
```

Variabel lingkungan auto-generated berada di `.env`
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`VITE_SUPABASE_PROJECT_ID`) — **jangan diedit manual**.

---

## 6. Konvensi & Larangan

- ❌ Jangan menyimpan `role` di `profiles` / `businesses` (privilege escalation).
- ❌ Jangan mengedit `src/integrations/supabase/client.ts` atau `types.ts`.
- ❌ Jangan menulis ke schema `auth`, `storage`, `realtime`, `supabase_functions`, `vault`.
- ❌ Jangan pakai warna merah untuk UI utama; ikuti palet cobalt blue & neon yellow.
- ❌ Jangan pakai font selain Inter kecuali ada arahan eksplisit.
- ✅ Selalu Indonesian-first untuk copywriting (audiens utama: pemilik F&B Indonesia).
- ✅ Selalu mobile-first; desktop adalah enhancement.

---

## 7. Lisensi & Kontak

© EZPOS. Untuk kerjasama, lihat halaman `/contact` atau https://ezpos.id.
