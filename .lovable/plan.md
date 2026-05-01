
## Tujuan

Merapikan tampilan halaman `/blog` (listing) dan `/blog/:slug` (detail artikel) agar lebih konsisten dengan visual identity landing page EZPOS: hero gradient, card style, spacing, dan CTA branding.

## Perubahan

### 1. Blog Listing (`src/pages/Blog.tsx`)

- **Hero section**: Tambahkan hero banner dengan background gradient primary (sama seperti landing sections), badge pill "Blog EZPOS", dan heading + subtitle yang lebih prominent.
- **Card styling**: Tambahkan hover effect yang lebih halus, konsisten border-radius `rounded-2xl`, dan subtle gradient/shadow. Perbaiki alignment tag badges agar rata dan tidak berantakan saat jumlah tag berbeda.
- **CTA di bawah grid**: Tambahkan CTA section "Coba EZPOS Gratis" di bawah daftar artikel, konsisten dengan `LandingCTA` style.
- **Spacing**: Sesuaikan padding dan gap agar match dengan section spacing di landing page (py-16/py-24).

### 2. Blog Post Detail (`src/pages/BlogPost.tsx`)

- **Header area**: Tambahkan subtle blue accent line/divider di atas judul, dan perbaiki spacing breadcrumb-tag-title agar lebih compact dan clean.
- **Author & meta row**: Tambahkan avatar placeholder atau icon EZPOS di samping author name untuk visual consistency.
- **Article content**: Pastikan prose styling menggunakan warna primary untuk links dan heading yang konsisten.
- **CTA box di akhir artikel**: Tambahkan branded CTA card di bawah konten artikel (sebelum "Artikel Lainnya") — box dengan background primary/10, heading ajakan, dan tombol "Coba EZPOS Gratis".
- **"Artikel Lainnya" section**: Perbaiki card style agar match dengan listing page cards.

### 3. Minor Brand Touches

- Konsistenkan penggunaan `font-display` untuk semua heading di blog.
- Pastikan tag badges menggunakan warna `primary/10` dan `text-primary` secara konsisten.
- Tambahkan subtle decorative blur circles (background) di hero blog, mirip landing hero.

## File yang Diubah

- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`
