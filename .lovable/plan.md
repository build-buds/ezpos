

## Rencana: Restrukturisasi Landing Page EZPOS (Gaya IDEKU)

Mengubah struktur landing page EZPOS agar mengikuti layout & narasi seperti referensi IDEKU, namun tetap dengan brand EZPOS (Cobalt Blue + Neon Yellow + font Circular Std), bahasa Indonesia, mobile responsive, dan SEO friendly. Setiap section produk akan menyediakan **placeholder gambar** yang siap Anda ganti nanti.

### Struktur Halaman Baru

1. **Navbar** (`LandingNavbar.tsx` — update)
   - Menu: **Produk & Fitur** (dropdown), **Tentang Kami**, **Integrasi** (dropdown), **Karir**, **Resources**
   - CTA: "Daftar" (outline) + "Hubungi Kami" (CTA kuning)
   - Logo putih EZPOS (sudah ada)

2. **Hero** (`LandingHero.tsx` — update copy)
   - Headline: "Menyederhanakan Manajemen Restoran, Satu per Satu"
   - Sub: deskripsi produk EZPOS POS, QR, Kiosk, Queue
   - CTA: "Jadwalkan Demo" + "Tonton Video"
   - Gambar hero tetap (Ibu happy)

3. **Our Product Intro** (baru — `LandingProductIntro.tsx`)
   - Eyebrow "Produk Kami" + judul besar "Sederhanakan & Optimalkan Operasional Bisnis F&B Anda dengan Solusi Inovatif Kami"

4. **Main Products** (baru — `LandingMainProducts.tsx`)
   Layout selang-seling (gambar kiri/kanan), masing-masing dengan **placeholder gambar** (`<div>` aspect-ratio + import dari `@/assets/product-*.png` yang akan Anda ganti):
   - **EZPOS POS** — "Yang Dapat EZPOS POS Lakukan untuk Anda" (5 checklist)
   - **EZPOS QR** — "Tingkatkan Proses Pemesanan untuk Bisnis F&B Anda" (5 checklist)
   - **EZPOS Kiosk** — "Cara Inovatif & Mudah untuk Self-Service Ordering" (4 checklist)
   - **EZPOS Queue** — "Manajemen Antrian Modern untuk Restoran Anda" (4 checklist)
   Setiap card punya CTA "Pelajari lebih lanjut" + "Lihat Demo".

5. **Sub Products** (baru — `LandingSubProducts.tsx`)
   Grid 2 kolom dengan placeholder gambar:
   - **KDS (Kitchen Display System)**
   - **EDS (Expo Display System)**
   - **PDA (Waiter Order Device)**
   - **Cloud Printer**

6. **Others / Loyalty & Engagement** (baru — `LandingOthers.tsx`)
   - **Loyalty Programme** — "Tingkatkan Engagement Pelanggan dengan Program Loyalty" + placeholder gambar 3 mockup HP
   - **CRM & Biolink** (compact card)

7. **Why Choose EZPOS** (baru — `LandingWhyChoose.tsx`)
   - Heading kiri "Mengapa Memilih EZPOS?" + sub
   - 3 card di kanan (staggered): "POS Sederhana & Andal", "Dukungan Pelanggan Berdedikasi", "Berdayakan Bisnis F&B Anda"
   - Background watermark logo EZPOS opacity rendah

8. **Stats** (`LandingStats.tsx` — keep)
9. **How It Works** (`LandingHowItWorks.tsx` — keep)
10. **Pricing** (`LandingPricing.tsx` — keep, sudah Rp 500k)
11. **Testimonials** (`LandingTestimonials.tsx` — keep)
12. **Integrasi** (baru — `LandingIntegrations.tsx`)
    - Logo grid: WhatsApp, Midtrans, Xendit, Doku, Polar, Google, dll. (placeholder)
13. **FAQ** (`LandingFAQ.tsx` — keep)
14. **CTA** (`LandingCTA.tsx` — keep)
15. **Footer** (`LandingFooter.tsx` — keep, logo hitam)

### Placeholder Gambar Per-Section

Setiap section produk menggunakan komponen placeholder konsisten:
```text
┌─────────────────────────┐
│  [Aspect 4/3 atau 1/1]  │
│   Gambar Produk EZPOS   │
│   (klik ganti nanti)    │
└─────────────────────────┘
```
Path import yang disiapkan (file dummy SVG dibuat sementara, Anda tinggal replace):
- `src/assets/product-pos.png`
- `src/assets/product-qr.png`
- `src/assets/product-kiosk.png`
- `src/assets/product-queue.png`
- `src/assets/sub-kds.png`, `sub-eds.png`, `sub-pda.png`, `sub-printer.png`
- `src/assets/loyalty-mockup.png`
- `src/assets/why-choose-bg.png`

### SEO Friendly

- `<title>` & `<meta description>` Indonesia di `Landing.tsx` (sudah ada, akan diperkaya keyword: "kasir restoran, POS F&B, QR ordering Indonesia")
- Tag semantik: `<section aria-labelledby>`, `<h1>`–`<h3>` hierarki benar (hanya 1 `<h1>`)
- `alt` text deskriptif Indonesia di semua `<img>`
- `loading="lazy"` untuk gambar di bawah fold
- Open Graph & Twitter Card meta tags ditambahkan di `index.html`
- JSON-LD `SoftwareApplication` schema di `Landing.tsx`
- Sitemap link: `/terms`, `/privacy`, `/menu/:slug` tetap accessible

### Mobile Responsive (100%)

- Semua section pakai grid `grid-cols-1 md:grid-cols-2` dengan urutan gambar/teks dibalik via `order-*` di mobile (gambar selalu di atas teks)
- Container `px-4 md:px-6`, max-width `7xl`
- Font size pakai `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`
- Navbar mobile: hamburger Sheet (sudah ada) — tambahkan menu baru
- Tested breakpoints: 375px, 414px, 768px, 1024px, 1440px

### Files

**Created:**
- `src/components/landing/LandingProductIntro.tsx`
- `src/components/landing/LandingMainProducts.tsx`
- `src/components/landing/LandingSubProducts.tsx`
- `src/components/landing/LandingOthers.tsx`
- `src/components/landing/LandingWhyChoose.tsx`
- `src/components/landing/LandingIntegrations.tsx`
- `src/components/landing/ProductSection.tsx` (reusable: image + checklist + CTA)
- `src/assets/product-*.png` (placeholder SVG/PNG sementara)

**Edited:**
- `src/pages/Landing.tsx` (compose new sections + JSON-LD + meta)
- `src/components/landing/LandingNavbar.tsx` (menu baru + dropdown)
- `src/components/landing/LandingHero.tsx` (copy & CTA disesuaikan)
- `index.html` (Open Graph + Twitter meta)

### Catatan
- Warna merah pada referensi IDEKU **diganti** ke Cobalt Blue (`primary`) — checklist icon, eyebrow, link "Pelajari lebih lanjut" semua biru. Aksen kuning hanya untuk CTA utama.
- Tidak ada warna merah dipakai (sesuai brand rule).
- Semua tombol berfungsi: scroll ke section, navigate ke `/auth`, atau buka WhatsApp untuk "Hubungi Kami".

