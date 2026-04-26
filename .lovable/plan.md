

## Rencana: Landing Page EZPOS

Membuat landing page baru di route `/` (menggantikan SplashScreen sebagai halaman publik utama) dengan gaya inspirasi Olsera namun memakai brand EZPOS (Cobalt Blue + Neon Yellow).

### Struktur Halaman (`src/pages/Landing.tsx`)

1. **Navbar** — Logo EZPOS, menu (Fitur, Bisnis, Harga, Blog), tombol "Masuk" + CTA "Coba Gratis" (kuning neon).
2. **Hero** — Headline besar Playfair `#SelaluAda Bersama Pelaku Usaha Indonesia`, sub Inter, dua CTA ("Coba Gratis" → `/auth`, "Lihat Demo" → scroll), ilustrasi/mockup kanan.
3. **Stats / Trust** — `9+ tahun`, `11.000+ Brand`, `33+ Provinsi`, badge "Aman & Terenkripsi".
4. **Business Types** — 3 kartu: Restoran & Kafe, Warung Makan, Toko Retail (pakai warna kategori existing).
5. **Features** — Grid 6 fitur (POS, Produk, Laporan, Menu Digital, PWA Offline, Notifikasi) dengan ikon lucide.
6. **How it Works** — 3 langkah: Daftar → Setup Bisnis → Mulai Jualan.
7. **Pricing** — 2 kartu (Gratis vs Pro Rp 299.000/bln) dengan CTA → `/pricing` (atau `/auth` jika belum login).
8. **Testimoni** — 3 kartu testimoni singkat.
9. **FAQ** — Accordion shadcn 5-6 pertanyaan.
10. **CTA Final** — Banner biru besar "#SelaluAda untuk membantu bisnismu" + tombol Coba Gratis.
11. **Footer** — Link Tentang, Kontak, Terms, Privacy, sosmed.

### Styling
- Tambah Playfair Display ke `src/index.css` (Google Fonts import) + `font-display` di `tailwind.config.ts`.
- Headline: `font-display` (Playfair), body: `font-sans` (Inter, sudah ada).
- Warna: Primary biru cobalt untuk headline accent, CTA `variant="cta"` (kuning neon) untuk semua tombol utama.
- Mobile-first: grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, navbar hamburger via `Sheet` di mobile.

### Routing (`src/App.tsx`)
- Route `/` → `Landing` (publik, bukan SplashScreen lagi).
- Route `/splash` → `SplashScreen` (tetap untuk auth check internal jika dipakai).
- Auth check: jika user sudah login & onboarded, tombol CTA mengarah ke `/dashboard`, kalau belum ke `/auth`. Pakai `useApp()` context.

### Tombol & Navigasi (semua harus berfungsi)
- "Coba Gratis" / "Daftar" → `/auth`
- "Masuk" → `/auth`
- "Harga" / "Lihat Paket" → smooth scroll ke `#pricing` section
- "Fitur" → scroll `#features`
- "Pilih Paket Pro" → `/auth` (lalu redirect ke `/pricing` setelah login)
- Footer Terms/Privacy → `/terms`, `/privacy`
- Hamburger mobile → `Sheet` dengan link sama

### File yang Diubah / Dibuat
- **Baru**: `src/pages/Landing.tsx`, `src/components/landing/` (Navbar, Hero, Features, Pricing, FAQ, Footer — split untuk maintainability)
- **Edit**: `src/App.tsx` (route `/` → Landing), `src/index.css` (import Playfair), `tailwind.config.ts` (`fontFamily.display`)
- **Tetap**: SplashScreen dipindah ke route `/splash` atau dihapus jika tidak dipakai (akan dipindah, bukan dihapus, agar aman).

### Catatan
- Tidak menggunakan gambar dari Olsera (hanya inspirasi layout). Akan generate 1-2 ilustrasi mockup sederhana via `gradient + icon` atau pakai placeholder dari `public/`.
- Mobile responsive diuji pada breakpoint sm/md/lg.

