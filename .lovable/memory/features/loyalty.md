---
name: Loyalty Programme
description: Sistem loyalty member, poin otomatis, voucher, dan tier (bronze/silver/gold) terintegrasi POS
type: feature
---
Modul Loyalty (`/loyalty`) menggunakan tabel `loyalty_settings`, `loyalty_members`, `loyalty_vouchers`, `loyalty_transactions`, `loyalty_redemptions`. RPC: `award_loyalty_points`, `redeem_loyalty_voucher`, `adjust_loyalty_points`. Tier auto-update berdasarkan total_spent_rupiah (bronze<1jt, silver<5jt, gold≥5jt). Integrasi POS: panel member di sheet checkout — input no HP → award poin via RPC setelah transaksi sukses. Auto-create member opsional di settings. Welcome bonus dicatat di ledger sebagai type='bonus'.
