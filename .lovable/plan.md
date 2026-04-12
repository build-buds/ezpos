
Tujuan: memperbaiki kegagalan “Gagal membuat checkout. Coba lagi nanti.” pada halaman Pricing.

Apa yang saya temukan:
- Produk Polar untuk `EZPOS Pro` ada dan valid, jadi masalahnya kemungkinan bukan product ID.
- Halaman `src/pages/Pricing.tsx` selalu menampilkan toast generik, jadi alasan gagal yang sebenarnya tersembunyi.
- Backend function `supabase/functions/create-polar-checkout/index.ts` punya beberapa return awal untuk 401/400 tanpa logging.
- Log function terbaru hanya menunjukkan boot/shutdown, tanpa error detail. Itu cocok dengan kasus function berhenti di jalur “silent return”, paling mungkin karena auth token tidak ikut/invalid.
- Karena payload `productId` dan `successUrl` sudah diisi dari client, kandidat terkuat sekarang adalah masalah sesi login/token saat memanggil backend checkout.

Rencana implementasi:
1. Perjelas error di client
- Ubah `src/pages/Pricing.tsx` agar membaca error backend yang sebenarnya, bukan selalu toast generik.
- Tampilkan pesan yang lebih spesifik, mis. “Sesi login tidak valid, silakan login ulang” atau “Checkout gagal dibuat di backend”.

2. Validasi sesi sebelum buat checkout
- Di `Pricing.tsx`, cek sesi aktif terlebih dahulu lewat auth client sebelum memanggil backend.
- Jika user state ada tetapi access token kosong/stale, arahkan user login ulang daripada langsung invoke function.

3. Perkuat backend checkout function
- Tambahkan logging untuk semua jalur gagal di `create-polar-checkout`, termasuk:
  - header auth tidak ada
  - user tidak valid
  - body request tidak valid
  - respons dari Polar gagal
- Kembalikan respons error yang terstruktur agar client bisa menampilkan alasan real.
- Sekalian rapikan validasi input (`productId`, `successUrl`) supaya 400/401/500 lebih mudah dibedakan.

4. Sinkronkan auth state bila perlu
- Jika saat implementasi terlihat ada mismatch antara `user` di context dan sesi auth aktual, saya akan rapikan `AppContext` supaya halaman checkout hanya jalan saat sesi benar-benar siap.

5. Verifikasi end-to-end
- Login dengan akun `Miepadeh2026@gmail.com`
- Buka `/pricing`
- Klik “Upgrade ke Pro”
- Pastikan redirect ke checkout berhasil
- Gunakan kode `EZPOSTEST100`
- Pastikan kembali ke `/checkout/success` dan status pembayaran terbaca benar

Detail teknis:
- File utama yang akan diubah:
  - `src/pages/Pricing.tsx`
  - `supabase/functions/create-polar-checkout/index.ts`
- Mungkin ikut disentuh bila diperlukan:
  - `src/contexts/AppContext.tsx`
- Tidak terlihat perlu perubahan database untuk memperbaiki error create checkout ini.
- Fokus utama perbaikan: auth token readiness + observability error.
