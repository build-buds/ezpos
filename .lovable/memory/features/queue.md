---
name: EZPOS Queue
description: Modul antrian digital — manajemen owner di /queue + halaman publik /queue/:slug, ticket realtime via Supabase
type: feature
---

- Tabel `queue_settings` (1 per business) & `queue_tickets` (status: waiting/called/served/skipped/cancelled).
- RPC publik: `get_public_queue_business(slug)` & `create_queue_ticket(business_id, name, phone, party_size, note)` — return `{id, number, queue_position, eta_minutes}`. Nomor antrian = `prefix + lpad(seq,3)` reset harian.
- Realtime: tabel `queue_tickets` masuk `supabase_realtime`. Owner dashboard & halaman publik subscribe via `useQueue` hooks.
- Public dapat batalkan (UPDATE status='cancelled') via RLS check policy.
- Halaman publik state machine: welcome → form → status (live polling 8s + realtime). Ticket id disimpan di `localStorage` (`queue_ticket_<slug>`).
- Owner page `/queue` tabs: Live Board, Pengaturan, Riwayat (7 hari).
- Modul Pro (lihat `modules.ts`).