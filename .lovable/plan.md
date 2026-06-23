## KDS MVP — Kitchen Display System

Tambah modul Kitchen Display agar dapur bisa melihat pesanan masuk secara real-time, menandai item "sedang dimasak" → "siap disajikan". Multi-tenant, terisolasi per `business_id`.

### 1. Database (migration)

Tambah kolom status pada item transaksi tanpa mengubah struktur lama:

- `transactions.kitchen_status` (text, default `'pending'`): `pending` | `cooking` | `ready` | `served`
- `transactions.kitchen_updated_at` (timestamptz)
- Index: `(business_id, kitchen_status, created_at)` untuk antrian dapur
- Aktifkan Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions`
- RLS sudah ada (per business_id) — tidak berubah
- Trigger: saat transaksi baru `INSERT`, set `kitchen_status='pending'` untuk semua kategori `Makanan` & `Minuman` (otomatis via default; minuman/snack opsional difilter di UI)

### 2. Hook & realtime

File baru `src/hooks/useKitchen.ts`:
- `useKitchenOrders(status)` — query transaksi `business_id = currentBusinessId` + filter status, urut `created_at ASC`
- `useUpdateKitchenStatus()` — mutation update `kitchen_status` + `kitchen_updated_at`
- Subscribe channel `kitchen-<businessId>` (mount-safe, cleanup di unmount) → invalidate query

### 3. Halaman `/kds`

File baru `src/pages/KDS.tsx`, route protected, masuk sidebar & bottom nav:
- Header: judul "Kitchen Display", filter tab: Baru / Dimasak / Siap
- Grid kartu pesanan (mobile 1 kolom, tablet 2, desktop 3):
  - Nomor antrian / waktu masuk (mm:ss elapsed, warna kuning >5mnt, merah >10mnt → pakai `primary`/`destructive` token, **bukan red literal**)
  - List item: nama × qty
  - Catatan jika ada
  - Tombol aksi besar (touch-friendly): "Mulai Masak" → "Siap" → "Selesai"
- Polling fallback tiap 15 detik
- Empty state: ilustrasi + "Belum ada pesanan masuk"

### 4. Integrasi navigasi

- Tambah link KDS di `DesktopSidebar` (icon `ChefHat`) dan `BottomNav` (jika ada slot, atau via menu "Modul")
- Tambah route di `App.tsx`: `<Route path="/kds" element={<ProtectedRoute><KDS /></ProtectedRoute>} />`
- Update card "Segera Hadir" → "Tersedia" untuk KDS di Modules page

### 5. Konsistensi multi-tenant

- Semua query difilter `business_id = currentBusinessId`
- Channel realtime di-namespace `kitchen-${businessId}` untuk hindari cross-tenant leak
- Toast pakai `sonner`
- Color token semantik (no `bg-red-500`, gunakan `bg-destructive`)
- Mobile-first layout (`MobileLayout`)

### 6. Free vs Pro

KDS termasuk fitur Pro? **Saran: Free** (semua restoran butuh) — tapi batasi 1 device aktif. Atau gate ke Pro? → konfirmasi di bawah.

### 7. SEO & sitemap

KDS adalah halaman privat (auth required) → tidak perlu masuk sitemap, set `noIndex` via SEO component.

### Layout grid KDS

```text
┌─────────────────────────────────────────┐
│ Kitchen Display       [Baru|Masak|Siap] │
├─────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ #001   │ │ #002   │ │ #003   │        │
│ │ 02:14  │ │ 00:45  │ │ 05:30!│        │
│ │ 2× Mie │ │ 1× Nasi│ │ 3× Es  │        │
│ │ 1× Teh │ │        │ │        │        │
│ │[Masak] │ │[Masak] │ │[Siap]  │        │
│ └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────┘
```

### Konfirmasi sebelum eksekusi

1. **Akses paket**: KDS untuk Free atau Pro-only?
2. **Filter kategori**: tampilkan semua item, atau hanya kategori `Makanan` (skip Minuman/Snack)?
