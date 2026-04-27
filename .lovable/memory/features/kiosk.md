---
name: EZPOS Kiosk module
description: Self-service ordering kiosk dengan halaman manajemen owner di /kiosk dan halaman publik full-screen di /kiosk/:slug
type: feature
---
Modul Kiosk terdiri dari dua bagian:
- `/kiosk` (owner, ProtectedRoute) — tabs Ringkasan, Pengaturan, Transaksi. Atur enabled, judul welcome, warna aksen, idle timeout, tipe order, metode pembayaran (cash/qris/transfer), pesan sukses & T&C.
- `/kiosk/:slug` (public, no auth) — state machine: welcome → type → menu → cart → pay → success. Idle timer balik ke welcome. Insert ke `transactions` dengan `order_type` = `kiosk-dinein|kiosk-takeaway`, dan ke `kiosk_sessions` untuk analitik konversi.
Tabel: `kiosk_settings`, `kiosk_sessions`. RLS publik membaca settings ketika `enabled=true`, dan policy paralel di `products` / `transactions` / `businesses` untuk akses publik bisnis kiosk-aktif.
Loyalty tidak diintegrasikan di kiosk publik karena RLS `loyalty_members` owner-only — gunakan POS owner untuk award poin.
