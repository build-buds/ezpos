## Modul EZPOS Queue

Sistem antrian digital untuk F&B yang mengikuti 4 alur IDEKU Queue: **Scan QR → Join Queue → Notification → Skip the Line**. Pelanggan ambil nomor antrian sendiri via halaman publik, owner mengelola via dashboard real-time.

Mirror struktur modul **Kiosk** (sudah ada) supaya konsisten: dua bagian — manajemen owner (`/queue`) + halaman publik (`/queue/:slug`).

---

### 1. Database (migration baru)

**`queue_settings`** (1 row per business)
- `business_id` (unique), `enabled`, `welcome_title`, `welcome_subtitle`, `accent_color` (default `#2563EB`)
- `prefix` (default `A`) — prefix nomor antrian (mis. `A001`, `A002`)
- `ask_party_size` (bool), `ask_phone` (bool), `allow_preorder` (bool, default false — menu publik wajib aktif)
- `avg_serve_minutes` (default 5) — untuk estimasi tunggu
- `closed_message` (saat antrian ditutup), `terms`

**`queue_tickets`**
- `id`, `business_id`, `number` (text, mis. `A012`), `seq` (int, increment harian per business), `name`, `phone?`, `party_size?`, `note?`
- `status` (enum: `waiting`, `called`, `served`, `skipped`, `cancelled`)
- `preorder_transaction_id?` (link kalau pre-order)
- `created_at`, `called_at?`, `served_at?`, `served_at?`

**RLS**:
- Owner: full CRUD untuk business sendiri.
- Public (anon): `SELECT` `queue_settings` jika `enabled=true`; `INSERT` `queue_tickets` via RPC; `SELECT` ticket sendiri by id (untuk halaman status pelanggan).

**RPC `create_queue_ticket(_business_id, _name, _phone, _party_size, _note)`** (SECURITY DEFINER):
- Validasi `queue_settings.enabled=true`.
- Hitung `seq` berikutnya (count waiting+called hari ini + 1), generate `number` = `prefix + seq.padStart(3,'0')`.
- Insert ticket, return `{ id, number, position, eta_minutes }`.
- Cek limit transaksi free tier untuk owner sebelum izinkan baru.

**RPC `get_public_queue_business(_slug)`** (mirror `get_public_kiosk_business`).

---

### 2. Halaman Manajemen `/queue` (owner, protected, Pro)

3 Tabs:
- **Live Queue** — daftar tiket `waiting` & `called` real-time (Supabase Realtime di `queue_tickets`). Tiap kartu: nomor besar, nama, party size, waktu tunggu. Aksi: **Panggil** (→ `called` + notifikasi owner), **Layani** (→ `served`), **Lewati** (→ `skipped`). Counter: total menunggu, dipanggil, rata-rata tunggu hari ini.
- **Pengaturan** — toggle aktif, judul/subjudul, prefix, warna aksen, toggle tanya HP/party size/preorder, avg serve minutes, pesan tutup, T&C. Tampilkan link publik `/queue/:slug` + tombol Salin & QR (dipakai untuk poster meja).
- **Riwayat** — list ticket `served|skipped|cancelled` 7 hari terakhir + rata-rata tunggu, no-show rate.

### 3. Halaman Publik `/queue/:slug` (anon, full-screen mobile-first)

State machine sederhana:
1. **Welcome** — judul/subjudul + tombol besar **"Ambil Nomor Antrian"**. Kalau `enabled=false` → tampilkan `closed_message`.
2. **Form** — input nama (wajib), HP (jika `ask_phone`), jumlah orang (jika `ask_party_size`), catatan opsional. Tombol **Daftar Antrian**.
3. **Ticket Status** (live, polling/realtime by ticket id):
   - Nomor besar (`A012`), nama, posisi antrian (`#3 dari 7`), estimasi tunggu (`±15 menit`).
   - Status badge: Menunggu → **Dipanggil** (animasi + suara di tab) → Selesai.
   - Tombol "Batalkan" (set `cancelled`).
   - Jika `allow_preorder` & menu aktif → tombol "Pesan Sambil Menunggu" → buka `/menu/:slug` di tab baru.
4. Ticket id disimpan di `localStorage` (`queue_ticket_<slug>`) supaya pelanggan refresh tetap lihat status terakhir.

UX: kontras tinggi, font besar (text-xl baseline), warna aksen dari settings, animasi tap.

---

### 4. Modules hub & routing
- `src/data/modules.ts`: Queue → `status: "active"`, `path: "/queue"`.
- `src/App.tsx`: route `/queue` (protected) + `/queue/:slug` (public).

---

### 5. Files

**Created:**
- `supabase/migrations/<ts>_queue.sql` — tabel `queue_settings`, `queue_tickets`, RLS, RPC `create_queue_ticket`, `get_public_queue_business`. Tambah `queue_tickets` ke publication realtime.
- `src/pages/Queue.tsx` — manajemen owner (3 tabs).
- `src/pages/PublicQueue.tsx` — UI publik state machine.
- `src/components/queue/QueueLiveBoard.tsx` — list tiket aktif + aksi.
- `src/components/queue/QueueSettingsForm.tsx`
- `src/components/queue/QueueHistory.tsx`
- `src/hooks/useQueue.ts` — query/mutation hooks + realtime subscription.

**Edited:**
- `src/App.tsx` — 2 route baru.
- `src/data/modules.ts` — Queue → `active`.
- `src/integrations/supabase/types.ts` — auto-regen.

---

### 6. Tier & batasan
- Modul ditandai **Pro** (sesuai `modules.ts`). Akses `/queue` (manajemen) dibatasi `useIsPro` (pola sama Kiosk). UI publik `/queue/:slug` tetap jalan jika `queue_settings.enabled=true`.
- Free tier: tetap bisa coba di dashboard tetapi tombol simpan terkunci dengan CTA upgrade (pola Loyalty/Kiosk).

### 7. Out of scope iterasi ini (Coming Soon di Pengaturan)
- Notifikasi WhatsApp otomatis ke pelanggan (akan disambungkan bersama modul CRM/notification template).
- Display antrian publik full-screen di TV (akan dibuat di iterasi terpisah, mirror EDS).
- Panggilan suara otomatis (TTS).

Cakupan ini sudah meliputi 4 alur inti IDEKU Queue: Scan QR → Join Queue → Notifikasi (in-page realtime) → Skip the line (status live + opsi pre-order via menu yang sudah ada).
