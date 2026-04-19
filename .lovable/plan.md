
User wants 4 improvements to the Digital Menu feature:

1. **Kategori dropdown filter di public menu** — pelanggan bisa filter berdasarkan kategori (auto-populated dari kategori produk owner).
2. **Panduan logo 1:1** — helper text + visual hint saat upload logo.
3. **4 varian tema** (currently 3) — tambah 1 tema baru, pastikan style berbeda jelas.
4. **Custom slug** — owner bisa edit slug di settings.

Let me check current code for slug & themes briefly. From context I already have:
- `SettingsDigitalMenu.tsx` — slug auto-generated, not editable
- `PublicMenu.tsx` — 3 themes, no category filter
- `slug.ts` — generator exists

Plan is straightforward. Keep concise.

## Plan: Penyempurnaan Menu Digital

### 1. Filter Kategori di Halaman Publik (`PublicMenu.tsx`)
- Tambah dropdown "Semua Kategori" di atas list menu
- Auto-populate dari kategori unik produk milik bisnis
- Filter list real-time saat dipilih
- Sticky di atas saat scroll, styled mengikuti accent color

### 2. Custom Slug di Settings (`SettingsDigitalMenu.tsx`)
- Field input slug bisa diedit (sebelumnya read-only)
- Validasi: lowercase, angka, dash saja (regex `^[a-z0-9-]+$`), 3-40 karakter
- Cek unik via query ke `businesses` sebelum save (exclude business sendiri)
- Jika slug bentrok → toast error "Slug sudah dipakai bisnis lain"
- Tampilkan preview URL real-time: `ezpos.app/menu/{slug}`
- Tombol "Acak" untuk regenerate otomatis

### 3. Panduan Upload Logo 1:1 (`SettingsDigitalMenu.tsx`)
- Helper text di bawah label: "Gunakan gambar persegi (1:1), min 200x200px, max 2MB"
- Validasi client-side: cek width === height saat user pilih file
- Jika tidak 1:1 → toast warning "Gambar harus rasio 1:1 (persegi). Crop dulu sebelum upload."
- Preview thumbnail tetap kotak 1:1 (sudah ada)

### 4. Tambah 1 Tema (Total 4 Varian)

| Tema | Style |
|---|---|
| **Classic** | Putih bersih, kartu border tipis (existing) |
| **Warm** | Beige/cream, cocok warung tradisional (existing) |
| **Modern** | Dark mode elegan (existing) |
| **Minimal** *(baru)* | Polos tanpa kartu, list flat, separator garis tipis — clean & cepat dibaca |

Update di:
- `SettingsDigitalMenu.tsx` — array `themes` jadi 4 item
- `PublicMenu.tsx` — `themeStyles` jadi 4 entries + render kondisional untuk "minimal" (no card wrapper, pakai border-bottom)

### Files Modified
- `src/pages/PublicMenu.tsx` — dropdown kategori + tema minimal
- `src/components/settings/SettingsDigitalMenu.tsx` — editable slug + logo guide + 4 tema
- `src/lib/slug.ts` — export validator function `isValidSlug(slug)`

### Tidak Perlu
- Database migration (tidak ada kolom baru)
- Edge function (validasi slug cukup client-side query)
