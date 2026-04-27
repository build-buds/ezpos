## Tujuan

Membangun **Biolink Bisnis** end-to-end: setiap merchant dapat punya halaman publik `/bio/:slug` berisi avatar, bio, dan daftar link (menu, WhatsApp, IG, Maps, custom). Editor terintegrasi di dashboard, modul ini berubah dari `coming-soon` → `active`.

## Yang Akan Dibangun

### 1. Database (migration)
Tabel baru `public.biolinks`:
- `id` uuid PK, `business_id` uuid UNIQUE, `slug` text UNIQUE
- `enabled` bool default false
- `display_name` text, `bio` text, `avatar_url` text
- `theme` text default `'classic'` (classic / warm / modern / minimal — selaras dengan menu digital)
- `accent_color` text default `'#2563EB'`
- `links` jsonb default `'[]'` (array `{ id, label, url, icon, enabled }`)
- `view_count` int default 0
- `created_at`, `updated_at` timestamptz
- Trigger `update_updated_at_column` di-attach untuk `updated_at`

**RLS**:
- Owner CRUD: pakai pola `business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())`
- Public SELECT: `enabled = true` untuk role `anon, authenticated`

### 2. Halaman Publik `/bio/:slug`
- File `src/pages/PublicBiolink.tsx` + route di `App.tsx`
- Layout linktree-style: avatar bulat → display name → bio → tombol-tombol link full-width
- Auto-link ke menu digital bila business punya `menu_enabled` (tombol "Lihat Menu" muncul otomatis)
- Tema mengikuti `theme` + `accent_color`; ikon link dari lucide
- Footer "Powered by EZPOS"
- 404 friendly bila slug tidak ada / `enabled=false`
- Increment `view_count` sekali per load (RPC `increment_biolink_view`)

### 3. Editor Dashboard
Komponen baru `src/components/settings/SettingsBiolink.tsx` (mengikuti pola `SettingsDigitalMenu`):
- Toggle Aktif/Nonaktif
- Slug editor (validasi via `isValidSlug`, cek unik di DB sebelum save)
- Display name, bio (textarea)
- Upload avatar → bucket `product-images` (sudah public)
- Pemilih tema (4 opsi) + accent color picker
- **Manajemen Link**: tambah/edit/hapus/reorder (drag handle naik-turun via tombol). Field per link: label, URL, ikon (Instagram, WhatsApp, Globe, Music, Mail, Phone, MapPin, Link), enabled
- Quick-add buttons: WhatsApp (auto wa.me), Instagram, Maps, Email
- Preview link publik + tombol Copy + Open
- Generate QR code biolink (reuse pola QR di SettingsDigitalMenu)

### 4. Integrasi Navigasi
- Tambah halaman editor `src/pages/Biolink.tsx` yang membuka `SettingsBiolink` sebagai full page (sesuai instruksi user "semua modul jadi satu di dashboard, mudah dinavigasi")
- Route protected `/biolink`
- Update `src/data/modules.ts`: biolink → `status: "active"`, `path: "/biolink"`
- Modul kartu di `/modules` akan otomatis muncul di section "Aktif" dan navigasi langsung ke `/biolink`
- Tambah shortcut "Biolink" di Settings page (link ke `/biolink`)

### 5. QA Manual
- Buat biolink test → buka `/bio/:slug` di incognito → verifikasi link bekerja, view_count naik
- Toggle off → halaman publik 404
- Slug duplikat → pesan error jelas

## Catatan Teknis

- Slug biolink dipisah dari slug menu digital agar bisa berbeda (mis. menu = `warung-budi`, bio = `budi`)
- RPC `increment_biolink_view(_slug text)` security definer agar anon bisa increment tanpa update RLS terbuka
- File yang akan dibuat: migration SQL, `src/pages/PublicBiolink.tsx`, `src/pages/Biolink.tsx`, `src/components/settings/SettingsBiolink.tsx`
- File yang diubah: `src/App.tsx`, `src/data/modules.ts`, `src/pages/Settings.tsx` (tambah entry)
- Tidak ada perubahan di tabel `businesses`
