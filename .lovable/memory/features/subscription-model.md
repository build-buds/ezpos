---
name: subscription-model
description: Polar.sh + DOKU payment integration, Freemium + Pro (Rp 500k/mo)
type: feature
---
Integrasi pembayaran menggunakan dua gateway:
1. **Polar.sh** (kartu internasional, Product ID: `b5ab8339-8495-488b-b487-0a4502740459`) — edge function `create-polar-checkout` & `verify-polar-checkout`.
2. **DOKU** (VA, E-Wallet, QRIS untuk pasar Indonesia) — edge function `create-doku-checkout` (auth) & `doku-notification` (public webhook, `verify_jwt = false`). Webhook URL: `https://geepcyqmgracqsvqgeks.supabase.co/functions/v1/doku-notification`.

Model bisnis Freemium + Pro Rp 500.000/bulan. Halaman Pricing menampilkan Dialog pemilihan metode pembayaran.
Aktivasi DOKU dilakukan server-side via webhook (verifikasi HMAC-SHA256 signature). CheckoutSuccess polling tabel `subscriptions` untuk auto-redirect setelah webhook landed.
