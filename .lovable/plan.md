
# Halaman Blog SEO untuk EZPOS

## Pendekatan

Artikel blog disimpan sebagai **data statis** di file `src/data/blog-posts.ts`. Untuk menambah artikel baru, Anda cukup menambahkan object baru ke array di file tersebut — tidak perlu database atau CMS.

## Yang Akan Dibuat

### 1. Data artikel — `src/data/blog-posts.ts`
- Array of blog post objects dengan field: `slug`, `title`, `description`, `content` (HTML string), `date`, `author`, `image`, `tags`, `readTime`
- Sudah terisi 2-3 artikel contoh bertema F&B/POS agar langsung ada konten

### 2. Halaman daftar blog — `src/pages/Blog.tsx`
- Route: `/blog`
- Layout: LandingNavbar + LandingFooter (sama seperti /contact)
- SEO component + BlogPosting JSON-LD schema
- Grid kartu artikel (gambar, judul, tanggal, excerpt, tags)
- Responsive: 1 kolom mobile, 2-3 kolom desktop

### 3. Halaman detail artikel — `src/pages/BlogPost.tsx`
- Route: `/blog/:slug`
- SEO meta unik per artikel (title, description, canonical, OG)
- Article JSON-LD schema (BlogPosting)
- Heading hierarchy: H1 judul, H2/H3 di konten
- Breadcrumb (Beranda > Blog > Judul Artikel)
- Navigasi "Artikel Lainnya" di bawah

### 4. Update routing — `src/App.tsx`
- Tambah route `/blog` dan `/blog/:slug` (publik, tanpa ProtectedRoute)

### 5. Update SEO files
- `public/sitemap.xml` — tambah `/blog`
- `public/robots.txt` — pastikan `/blog` tidak di-disallow
- `scripts/prerender-meta.ts` — tambah route `/blog` untuk prerender

### 6. Link di navbar/footer
- Tambah link "Blog" di LandingNavbar dan LandingFooter

---

## Cara Menambah Artikel Baru

Setelah selesai, untuk menambah artikel baru Anda cukup:

1. Buka file `src/data/blog-posts.ts`
2. Tambahkan object baru ke array, contoh:

```ts
{
  slug: "judul-artikel-baru",
  title: "Judul Artikel Baru",
  description: "Deskripsi singkat untuk meta SEO...",
  content: `<p>Isi artikel dalam HTML...</p>`,
  date: "2026-05-01",
  author: "EZPOS Team",
  image: "/blog/nama-gambar.webp",
  tags: ["POS", "Tips"],
  readTime: 5,
}
```

3. (Opsional) Taruh gambar di `public/blog/`
4. Deploy — artikel otomatis muncul di `/blog` dan bisa diakses di `/blog/judul-artikel-baru`

Tidak perlu sentuh file lain — halaman blog dan detail otomatis membaca dari array data tersebut.
