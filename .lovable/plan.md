# Plan: Perbaikan 3 Bug Kritis EZPOS

Plan ini hanya menangani 3 isu 🔴 prioritas tertinggi dari audit. Warning lainnya bisa dikerjakan di sesi terpisah.

---

## Bug #1 — Crash halaman Kiosk publik

**Masalah**: `PublicKiosk.tsx:161` memakai `<Monitor />` tapi ikon `Monitor` tidak ada di daftar import `lucide-react`. Saat user membuka `/kiosk/<slug>` untuk kiosk yang belum aktif/slug salah, halaman crash (white screen + ReferenceError).

**Perbaikan**:
- Tambahkan `Monitor` ke import `lucide-react` di `src/pages/PublicKiosk.tsx`.
- Verifikasi tidak ada ikon lain yang juga lupa di-import (scan cepat seluruh JSX file ini).

---

## Bug #2 — Push Notification tidak berfungsi

**Masalah**:
1. Import `corsHeaders` dari path invalid `npm:@supabase/supabase-js@2/cors` → bisa membuat seluruh edge function gagal dimuat.
2. Payload push dikirim tanpa enkripsi RFC 8291 → browser modern menolak.

**Perbaikan** di `supabase/functions/send-push-notification/index.ts`:
- Ganti import CORS yang salah dengan deklarasi `corsHeaders` lokal (objek `Access-Control-Allow-Origin`, `Allow-Headers`, `Allow-Methods`).
- Implementasi enkripsi Web Push standard menggunakan library Deno `https://deno.land/x/webpush@…` atau setara (`jsr:@negrel/webpush`) yang menangani VAPID JWT + payload encryption (aes128gcm) dengan key `p256dh` dan `auth` dari `push_subscriptions`.
- Hapus subscription dari DB jika response push 404/410 (subscription expired).
- Tetap pakai secrets `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` yang sudah ada.

---

## Bug #3 — Artikel blog tidak ada di sitemap

**Masalah**: `public/sitemap.xml` hanya berisi `/blog` (index), 6 URL `/blog/<slug>` tidak terdaftar → Google tidak meng-crawl artikel via sitemap.

**Perbaikan**:
- Tambahkan entry `<url>` untuk setiap slug di `src/data/blog-posts.ts` ke `public/sitemap.xml`, dengan `lastmod` = tanggal publish artikel, `changefreq=monthly`, `priority=0.7`.
- (Opsional, kalau diinginkan otomatis ke depan) Tambahkan langkah generate ke `scripts/prerender-meta.ts` agar sitemap di-rewrite saat build. Kalau tidak diminta sekarang, lewati supaya scope kecil.

---

## Detail Teknis

| File | Aksi |
|------|------|
| `src/pages/PublicKiosk.tsx` | Tambah `Monitor` ke import `lucide-react` |
| `supabase/functions/send-push-notification/index.ts` | Ganti import CORS + implementasi Web Push terenkripsi via library Deno |
| `public/sitemap.xml` | Append 6 `<url>` blog post |

## Verifikasi
1. Cek build/typecheck output untuk `PublicKiosk.tsx` & edge function (auto-deploy).
2. Test panggil edge function `send-push-notification` via `curl_edge_functions` ke user yang sudah subscribe; cek log.
3. Buka `/sitemap.xml` di preview, pastikan 6 URL blog muncul.

## Tidak termasuk (sesuai permintaan)
- Race condition `loadBusinessData`
- Inkonsistensi harga prerender vs UI
- Warning lain (stok POS, QRIS kiosk, dll.)
