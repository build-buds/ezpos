## Tujuan
Sinkronkan dashboard EZPOS dengan janji landing page. Fitur high-impact dibangun penuh, sisanya tampil sebagai item menu dengan badge **"Segera Hadir"** + halaman info & form notify.

## Audit Landing → Dashboard

| Fitur landing | Status saat ini | Rencana |
|---|---|---|
| Kasir POS Cepat | ✅ Ada (`/pos`) | Tetap |
| Manajemen Produk | ✅ Ada (`/products`) | Tetap |
| Laporan Real-time | ✅ Ada (`/reports`) | Tetap |
| Menu Digital QR | ✅ Ada (Settings → Menu Digital) | Tetap |
| Mode Offline | ✅ Ada (banner + cache) | Tetap |
| Notifikasi Pintar | ✅ Ada (push + in-app) | Tetap |
| **EZPOS QR Order** (pesan dari meja → KDS) | ⚠️ Hanya menu view, belum bisa order | **Bangun penuh** |
| **KDS** (Kitchen Display) | ❌ Belum ada | **Bangun penuh** (dependency QR Order) |
| **Loyalty Programme** (poin, member) | ❌ Belum ada | **Bangun penuh** |
| **CRM Pelanggan** | ❌ Belum ada | **Bangun penuh** (dasar: data customer + segmentasi) |
| **Biolink** halaman bisnis | ❌ Belum ada | **Bangun penuh** (sederhana) |
| **EZPOS Kiosk** self-service | ❌ Belum ada | 🟡 Coming Soon |
| **EZPOS Queue** antrian | ❌ Belum ada | 🟡 Coming Soon |
| **EDS** Expo Display | ❌ Belum ada | 🟡 Coming Soon |
| **PDA** Waiter Device | ❌ Belum ada | 🟡 Coming Soon |
| **Cloud Printer** | ❌ Belum ada | 🟡 Coming Soon |

## Strategi Eksekusi (5 iterasi)

Karena scope sangat besar, saya bagi menjadi **5 iterasi terpisah** yang masing-masing bisa dirilis & diuji. Plan ini mendeskripsikan **arsitektur** seluruhnya, tapi implementasi dilakukan iterasi per iterasi setelah Anda approve plan ini. Setelah selesai iterasi ke-N, Anda bisa lanjut ke N+1 atau berhenti.

### Iterasi 1 — Navigasi Modul + Coming Soon (cepat, fondasi)
- Tambah menu **"Modul"** baru di sidebar/bottom-nav (atau jadikan "Lainnya" di bottom-nav sebagai grid modul, Settings dipindah ke header).
- Halaman `/modules` menampilkan **semua modul** sebagai card dengan status:
  - ✅ Aktif (link langsung)
  - 🟡 Segera Hadir (klik → halaman info + tombol "Notify saya")
- Halaman info per modul `/modules/:slug` (kiosk, queue, eds, pda, printer) dengan deskripsi, ilustrasi, dan form interest.
- Tabel baru: `module_interests (user_id, module_slug, created_at)`.

### Iterasi 2 — EZPOS QR Order + KDS
- Public menu `/menu/:slug` ditambah **keranjang & form order** (nama meja/no meja).
- Tabel baru: `orders (id, business_id, table_no, customer_name, items jsonb, status, created_at)`. Status: `new → preparing → ready → served`.
- Halaman dashboard baru `/kds` (Kitchen Display) — list order real-time (Supabase Realtime), tombol ubah status, suara notifikasi pesanan baru.
- Pesanan selesai (`served`) otomatis dibuat sebagai transaction.
- Setting di Settings → Menu Digital: toggle "Terima order online".

### Iterasi 3 — Loyalty Programme
- Tabel baru: `customers (id, business_id, name, phone, points, total_spent)`, `loyalty_config (business_id, points_per_rupiah, redeem_ratio)`.
- Halaman `/loyalty` di dashboard:
  - Tab "Member" — list customer + poin
  - Tab "Pengaturan" — atur rasio poin (contoh: 1 poin / Rp 1.000)
- Integrasi di POS: input/scan no HP customer saat checkout → poin otomatis ditambah; opsi redeem poin sebagai diskon.

### Iterasi 4 — CRM
- Reuse tabel `customers`. Tambah field `tags`, `last_visit`, `notes`.
- Halaman `/crm` di dashboard:
  - List + search + filter customer
  - Detail customer: riwayat transaksi, total spend, frekuensi
  - Segmentasi (VIP, regular, dorman) auto berdasarkan total_spent & last_visit
  - Export CSV
- Quick action: kirim pesan WhatsApp (open `wa.me/<nomor>?text=...` dengan template).

### Iterasi 5 — Biolink
- Tabel baru: `biolinks (business_id, slug, bio, links jsonb, theme, avatar_url)`.
- Public route `/bio/:slug` — landing minimal: avatar, nama, bio, daftar link (menu digital, WhatsApp, IG, lokasi Google Maps, telpon).
- Editor di Settings → Biolink: drag & drop list link, pilih tema, copy URL.

## Struktur Halaman Dashboard Sesudah Selesai

```text
Bottom nav (mobile)        Sidebar (desktop)
├─ Dashboard               ├─ Dashboard
├─ Kasir                   ├─ Kasir
├─ Produk                  ├─ Produk
├─ Modul ▼                 ├─ Modul
│  ├─ KDS                  │  ├─ KDS                ✅
│  ├─ Loyalty              │  ├─ Loyalty            ✅
│  ├─ CRM                  │  ├─ CRM                ✅
│  ├─ Biolink              │  ├─ Biolink            ✅
│  ├─ Kiosk        🟡      │  ├─ Kiosk           🟡
│  ├─ Queue        🟡      │  ├─ Queue           🟡
│  ├─ EDS          🟡      │  ├─ EDS             🟡
│  ├─ PDA          🟡      │  ├─ PDA             🟡
│  └─ Cloud Printer 🟡     │  └─ Cloud Printer   🟡
├─ Laporan                 ├─ Laporan
└─ Pengaturan              └─ Pengaturan
```

## Detail Teknis

- **Database**: tabel baru semuanya RLS — owner-only via `business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())`. Public read hanya untuk `biolinks` & order submission.
- **Realtime**: enable `supabase_realtime` untuk tabel `orders` (KDS) — pakai pola mount-safe yang sudah ada di project memory.
- **Pro gating**: KDS, Loyalty, CRM, Biolink → fitur Pro (cek `useIsPro()`). User free lihat preview + CTA upgrade.
- **Routing**: tambah route baru di `src/App.tsx`, semua di-wrap `ProtectedRoute`.
- **Memory updates**: setiap iterasi update `mem://features/` masing-masing.

## Pertanyaan Sebelum Mulai

Setelah plan ini di-approve, saya akan **mulai dari Iterasi 1** (navigasi Modul + Coming Soon). Setelah selesai, Anda boleh minta lanjut ke Iterasi 2, atau ubah urutannya. Apakah urutan ini OK, atau Anda ingin urutan lain (misal Loyalty dulu sebelum KDS)?