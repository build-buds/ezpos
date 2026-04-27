
## Tujuan
Membuat halaman baru `/contact` (Hubungi Kami) yang terinspirasi dari screenshot yang Anda berikan, namun **menggunakan brand EZPOS** (Cobalt Blue `#2563EB` + Neon Yellow `#D4FF00`, font Inter, gaya minimalis landing page yang ada). Tombol "Hubungi Kami" di **navbar (desktop & mobile)** akan diubah agar mengarah ke halaman ini, bukan langsung ke WhatsApp.

## Perubahan

### 1. Halaman baru: `src/pages/Contact.tsx`
Struktur halaman:
- **LandingNavbar** di atas (konsisten dengan landing).
- **Hero section** dengan tagline "Hubungi Kami" + "Mari Terhubung dengan EZPOS" (kata "EZPOS" diberi warna accent / Neon Yellow di atas background gelap, atau primary blue di atas background terang — selaras brand).
- **Layout 2 kolom** (stack di mobile):
  - **Kolom kiri** — info kontak:
    - "Kami akan merespons dalam 24 jam"
    - **Lokasi Kami** — alamat kantor (placeholder Jakarta / akan diisi user nanti)
    - **Email Kami** — `halo@ezpos.id`
    - **Kontak Kami** — nomor WhatsApp `+62 812-3456-7890`
    - Setiap item memakai ikon dari `lucide-react` (`MapPin`, `Mail`, `Phone`) di dalam rounded square dengan background `bg-primary/10` dan ikon `text-primary`.
  - **Kolom kanan** — form kontak (Card dengan `bg-card`, `rounded-2xl`, `border`, `shadow-sm`):
    - Nama* (Input)
    - Nomor HP* (Input dengan prefix +62)
    - Email* (Input)
    - Subjek* (Input)
    - Pesan (Textarea)
    - Checkbox: "Saya setuju menerima informasi & promosi dari EZPOS"
    - Tombol **Kirim** full-width memakai `variant="cta"` (Neon Yellow) — selaras brand.
- **LandingFooter** di bawah.
- Tombol **floating WhatsApp** di pojok kanan bawah ("Chat dengan kami di WhatsApp") menggunakan warna hijau WhatsApp standar (pengecualian fungsional, bukan elemen brand utama) — opsional, bisa dihilangkan kalau Anda mau strict brand only. Saya akan **menyertakan** karena ada di referensi.

### 2. Validasi & submit form
- Pakai **zod** + react-hook-form (sudah ada di project) untuk validasi:
  - nama 1–100 char, email valid, telp 8–20 digit, subjek 1–150 char, pesan max 1000 char.
- Saat submit: format pesan lalu **buka WhatsApp** ke `https://wa.me/6281234567890?text=...` (encodeURIComponent) di tab baru, dan tampilkan toast `sonner` "Pesan berhasil dikirim, kami akan menghubungi Anda segera." (Tidak perlu backend — sesuai pola landing page existing.)

### 3. Routing — `src/App.tsx`
Tambah route publik:
```tsx
<Route path="/contact" element={<Contact />} />
```

### 4. Update tombol "Hubungi Kami" — `src/components/landing/LandingNavbar.tsx`
- Desktop & mobile: ubah `onClick` dari `window.open(wa.me/...)` menjadi `navigate("/contact")`. Tetap pakai `variant="cta"`.

### 5. Mobile responsive
- Grid `grid-cols-1 lg:grid-cols-2` untuk konten utama.
- Padding responsif `px-4 md:px-6 lg:px-8`, `py-12 md:py-20`.
- Form tetap full-width di mobile, tombol Kirim full-width.
- Floating WhatsApp button: `fixed bottom-4 right-4` dengan ukuran lebih kecil di mobile.

### 6. Animasi
- Re-use `useRevealOnScroll` + atribut `data-reveal` agar konsisten dengan landing page.

## Brand compliance
- Warna: `bg-primary` untuk header hero, `text-accent` untuk highlight kata "EZPOS", `variant="cta"` untuk tombol Kirim.
- Font: Inter (default project).
- Tidak ada warna merah (sesuai aturan brand).
- Border radius `rounded-2xl` selaras dengan komponen landing existing.

## File yang akan dibuat / diubah
- ➕ `src/pages/Contact.tsx` (baru)
- ✏️ `src/App.tsx` (tambah route)
- ✏️ `src/components/landing/LandingNavbar.tsx` (ubah CTA navigate ke /contact)

Setelah Anda menyetujui plan ini, saya akan langsung mengeksekusinya.
