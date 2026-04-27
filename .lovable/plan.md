## Modul EZPOS Kiosk

Self-service ordering untuk pelanggan F&B — mengikuti panduan IDEKU Kiosk: **simple ordering**, **seamless POS integration**, **reduce manpower**, **promotions surface**.

Karena kiosk adalah perangkat yang dipakai pelanggan (bukan owner), modul ini bekerja dalam dua bagian:
1. **Halaman Manajemen** (`/kiosk`) — owner mengaktifkan & mengatur kiosk, lihat sesi/transaksi kiosk, salin link kiosk untuk dibuka di tablet/layar sentuh.
2. **Halaman Kiosk Publik** (`/kiosk/:slug`) — UI full-screen layar sentuh untuk pelanggan: pilih dine-in/takeaway → browse menu → tambah ke cart → checkout → input no HP loyalty (opsional) → bayar → struk + nomor antrian.

---

### 1. Database (Migration baru)

**`kiosk_settings`** (1 row per business)
- `business_id` (unique), `enabled`, `welcome_title`, `welcome_subtitle`, `accent_color` (default `#2563EB`), `idle_timeout_seconds` (default 60), `ask_order_type` (bool, default true), `ask_loyalty` (bool, default true), `payment_methods` (text[], default `{cash,qris}`), `success_message`, `terms`, `created_at`, `updated_at`

**`kiosk_sessions`** (analytics ringan: berapa sesi mulai vs konversi)
- `id`, `business_id`, `started_at`, `completed_at?`, `transaction_id?`, `order_type?`, `total?`

RLS: owner-only CRUD (pola sama dengan `loyalty_settings`). Public bisa SELECT `kiosk_settings` ketika `enabled=true` (untuk render kiosk publik tanpa login), dan public bisa INSERT `kiosk_sessions` + `transactions` untuk businesses yang `kiosk_settings.enabled=true`.

> Reuse: Produk diambil dari `products` (sudah ada policy public untuk `menu_enabled`; akan ditambah policy paralel untuk businesses yang kiosk-nya aktif). Loyalty memakai RPC `award_loyalty_points` yang sudah ada.

---

### 2. Halaman Manajemen `/kiosk` (owner)

Tabs:
- **Ringkasan** — total sesi 7 hari, conversion rate, rata-rata nilai order kiosk, link kiosk + tombol "Salin" & "Buka di tab baru" + QR untuk scan ke tablet.
- **Pengaturan** — toggle aktif, judul/subjudul welcome, warna aksen, idle timeout, toggle tanya tipe order & loyalty, pilih metode pembayaran yang muncul, pesan sukses & T&C.
- **Transaksi Kiosk** — list transaksi yang berasal dari kiosk (filter `transactions.order_type` di-tag `kiosk-dinein` / `kiosk-takeaway`).

### 3. Halaman Kiosk Publik `/kiosk/:slug` (full-screen, no auth)

Alur layar (state machine sederhana):
1. **Welcome** — judul + subjudul + tombol besar "Mulai Pesan". Idle timeout balik ke welcome.
2. **Pilih Tipe Order** (jika `ask_order_type`) — Dine-in / Takeaway dengan icon besar.
3. **Menu Browse** — grid produk besar (3-4 kolom), filter kategori horizontal scroll, search opsional, kartu produk tap untuk +1, mini-cart sticky bawah dengan total & "Lihat Pesanan".
4. **Cart Review** — list item dengan +/- besar, hapus, total, tombol "Lanjut Bayar".
5. **Loyalty (opsional)** — input no HP via numpad on-screen, atau "Lewati". Jika cocok → badge tier muncul.
6. **Pembayaran** — pilih metode dari `payment_methods`. Cash → numpad input nominal. QRIS → tampilkan QR placeholder + tombol "Konfirmasi Diterima" (oleh kasir).
7. **Sukses** — animasi check besar, nomor pesanan (`#` + last 4 dari `transaction_id`), pesan terima kasih, auto-redirect ke welcome setelah 8 detik.

Implementasi: insert ke `transactions` (status `completed`, `order_type` = `kiosk-dinein|kiosk-takeaway`), update `kiosk_sessions`, panggil `award_loyalty_points` jika ada member.

UX: full-screen tanpa `MobileLayout`, tombol minimal 56px, font besar (text-xl baseline), warna aksen dari settings, animasi tap.

---

### 4. Modules hub & routing
- `src/data/modules.ts`: status Kiosk → `active`, path `/kiosk`.
- `src/App.tsx`: route `/kiosk` (protected) + `/kiosk/:slug` (public).

---

### 5. Files

**Created:**
- `supabase/migrations/<ts>_kiosk.sql` — tabel `kiosk_settings`, `kiosk_sessions`, RLS, policy public produk untuk kiosk-aktif.
- `src/pages/Kiosk.tsx` — manajemen owner (tabs).
- `src/pages/PublicKiosk.tsx` — UI full-screen pelanggan (state machine).
- `src/components/kiosk/KioskSettingsForm.tsx`
- `src/components/kiosk/KioskOverview.tsx`
- `src/components/kiosk/KioskTransactions.tsx`
- `src/components/kiosk/Numpad.tsx` — numpad layar sentuh dipakai untuk loyalty phone & cash.
- `src/hooks/useKiosk.ts` — query/mutation hooks.

**Edited:**
- `src/App.tsx` — 2 route baru.
- `src/data/modules.ts` — Kiosk → active.
- `src/integrations/supabase/types.ts` — auto-regen.

---

### 6. Tier integrasi & batasan
- Dimark **Pro** (sesuai `modules.ts` saat ini). Akses `/kiosk` (manajemen) dibatasi cek `useIsPro` (mengikuti pola POS limit). UI publik `/kiosk/:slug` tetap dapat berjalan jika `kiosk_settings.enabled=true` (cek di server via RLS).
- Batas transaksi free tier (`FREE_TRANSACTION_LIMIT`) tetap berlaku — kiosk publik akan memunculkan pesan "Sementara tidak menerima pesanan" jika owner free tier sudah melewati batas bulanan.

### 7. Out of scope iterasi ini (Coming Soon di tab Pengaturan)
- Integrasi gateway QRIS otomatis (sekarang QR placeholder + konfirmasi manual).
- Cetak struk via Cloud Printer.
- Multi-bahasa & upselling otomatis (akan disambungkan saat modul Cloud Printer & CRM aktif).

Cakupan ini sudah cover **4 nilai unggulan IDEKU Kiosk**: Simple Ordering, Seamless POS Integration, Reduce Manpower, dan Promotions surface (lewat loyalty + warna aksen kustom).
