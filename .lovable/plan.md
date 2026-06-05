## Tujuan
Dashboard admin untuk memantau funnel pendaftaran sampai aktivasi (transaksi pertama), termasuk detail per toko & user.

## Akses
- Role baru `admin` di tabel `user_roles` (struktur memory sudah ada).
- Route baru `/admin` di-guard `ProtectedRoute` + cek `has_role(auth.uid(), 'admin')`. Non-admin: redirect ke `/dashboard`.
- Anda assign role via DB (1 baris insert) — tidak ada UI assign agar aman.

## Funnel yang dilacak (5 langkah)
1. **Signup** — `auth.users` (count)
2. **Pilih kategori** — diturunkan dari `businesses.category` (sudah tersimpan saat submit form)
3. **Buka toko** — row di `businesses`
4. **Tambah produk** — minimal 1 row di `products` untuk business tsb
5. **Transaksi pertama** — minimal 1 row di `transactions` untuk business tsb

Catatan: step "Pilih kategori tapi belum submit form" tidak tersimpan di DB (hanya localStorage). Tidak ditrack di v1 — kalau butuh, perlu tabel `onboarding_events` tambahan.

## Data sumber (edge function admin-stats)
Edge function `admin-stats` (verify_jwt + cek role admin) menjalankan query agregat dengan service role:

- KPI: total users, total businesses, total products, total transactions, GMV total, conversion% tiap step
- Timeline: signup vs business vs first-transaction per hari (30 hari) / per minggu (12 minggu) — toggle granularity
- Tabel **User Drop-off**: user yang signup tapi belum buat business (email, created_at, hari sejak signup)
- Tabel **Toko Baru** (paginated 20/page): nama toko, owner email, kategori, tanggal dibuat, jumlah produk, jumlah transaksi, GMV, transaksi terakhir, status (Aktif/Pasif/Dormant)
- Detail toko (drawer): list transaksi terakhir (20), produk top, ringkasan harian 7 hari

## UI (`/admin`)
Layout: header + tabs **Ringkasan | Toko | User**.

**Ringkasan**
- 6 KPI cards: Signup, Buka Toko, Tambah Produk, Transaksi 1st, GMV Total, Conv. Signup→Aktif
- Funnel bar chart (Recharts horizontal bar, 5 step) dengan % conversion antar step
- Timeline LineChart: signup vs new business vs first-tx per hari/minggu (toggle)

**Toko**
- Search + filter kategori/status
- Tabel toko + tombol "Detail" → Drawer transaksi & produk

**User**
- Tabel user belum buat toko (drop-off)
- Tabel admin (siapa saja yang punya role admin)

## Implementasi teknis
- **Migration**: pakai pola `user_roles` standar (enum `app_role`, tabel, `has_role` SECURITY DEFINER) bila belum ada — sudah ada di project; tinggal seed 1 admin.
- **Edge function** `supabase/functions/admin-stats/index.ts`:
  - Validate JWT via `getUser(accessToken)`
  - Cek `has_role(uid, 'admin')`, return 403 jika bukan admin
  - Endpoint via query param `?type=overview|timeline|businesses|users&granularity=day|week&page=N`
  - Pakai `SUPABASE_SERVICE_ROLE_KEY` untuk akses `auth.users` & agregat lintas business
- **Frontend**: 
  - `src/pages/Admin.tsx` (tabs + KPI + chart)
  - `src/components/admin/FunnelChart.tsx`, `TimelineChart.tsx`, `BusinessesTable.tsx`, `DropoffTable.tsx`, `BusinessDetailDrawer.tsx`
  - `src/hooks/useAdminStats.ts` (React Query, invoke edge function)
  - `src/components/AdminRoute.tsx` (wrap ProtectedRoute + role check via `useQuery` ke `user_roles`)
- **Route** ditambahkan ke `src/App.tsx`. Link "Admin" di DesktopSidebar/BottomNav muncul hanya jika role admin.

## Verifikasi
1. Login dengan email Anda → assign role admin via insert DB
2. Akses `/admin` → KPI cards & chart muncul, angka match dengan query manual
3. Login user biasa → redirect ke `/dashboard`
4. Klik detail toko → drawer transaksi terisi

## File yang akan dibuat/diubah
- (new) `supabase/functions/admin-stats/index.ts`
- (new) `src/pages/Admin.tsx`
- (new) `src/components/AdminRoute.tsx`
- (new) `src/components/admin/*` (FunnelChart, TimelineChart, BusinessesTable, DropoffTable, BusinessDetailDrawer)
- (new) `src/hooks/useAdminStats.ts`, `useIsAdmin.ts`
- (edit) `src/App.tsx` (route)
- (edit) `src/components/DesktopSidebar.tsx` + `BottomNav.tsx` (link admin kondisional)
- (migration) seed role `admin` untuk akun Anda (Anda akan beri email-nya saat eksekusi)
