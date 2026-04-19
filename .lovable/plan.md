
User wants to change pricing from Rp 299.000 to Rp 500.000.

Need to find all places displaying "299" or "299.000". From context I can see:
- `src/pages/Pricing.tsx` — displays "Rp 299.000/bulan"
- `src/pages/Settings.tsx` — displays "Rp 299.000/bulan" in upgrade button

Note: actual price charged is set on Polar.sh (server-side), not in code. This change only updates display. User should also update Polar product price on dashboard separately — I'll mention it.

## Plan: Update Display Pricing ke Rp 500.000

### File yang diubah
1. **`src/pages/Pricing.tsx`** — ubah `Rp 299.000` → `Rp 500.000` di kartu Pro
2. **`src/pages/Settings.tsx`** — ubah `Rp 299.000/bulan` → `Rp 500.000/bulan` di tombol upgrade

### Catatan Penting
Harga aktual yang ditagih ke pelanggan diatur di **dashboard Polar.sh** (bukan di kode). Perubahan ini hanya update tampilan. Untuk memastikan pelanggan benar-benar dibayar Rp 500.000, owner perlu update harga produk di Polar.sh juga (Product ID: `b5ab8339-8495-488b-b487-0a4502740459`). Saya bisa bantu update via Polar tool jika diminta.
