

# Splash Screen + Auth Simulasi + Persistent Login

## Alur Baru

```text
Splash Screen (2 detik, logo Warung OS)
        ↓
Auth Page (Login / Register via Email+Password atau Google simulasi)
        ↓
Onboarding Category (pilih jenis bisnis) — hanya jika belum onboarding
        ↓
Dashboard
```

Saat user kembali ke app, data login tersimpan di `localStorage` → langsung masuk Dashboard.

## Yang Dibuat / Diubah

### 1. Halaman Splash Screen (`src/pages/SplashScreen.tsx`)
- Tampilan full-screen dengan logo "Warung OS" (teks + ikon styled)
- Animasi fade-in lalu auto-redirect setelah 2 detik
- Jika sudah login (cek localStorage) → Dashboard
- Jika belum → Auth page

### 2. Halaman Auth (`src/pages/Auth.tsx`)
- Form login/register dengan tab toggle
- Input: Email + Password
- Tombol "Masuk dengan Google" (simulasi — langsung login)
- Simpan info user ke localStorage
- Setelah login: jika belum onboarding → `/onboarding`, jika sudah → `/dashboard`

### 3. Update `AppContext.tsx`
- Tambah state `user` (email, name) + `isLoggedIn`
- Load/save state dari localStorage agar persistent
- Tambah fungsi `login()`, `logout()`, `register()`

### 4. Update `App.tsx`
- Tambah route `/splash` dan `/auth`
- Ubah `/` ke SplashScreen

### 5. Update `Index.tsx`
- Redirect logic: cek login dulu, lalu cek onboarding

### 6. Update `Settings.tsx`
- Tambah tombol "Logout" yang clear localStorage dan redirect ke `/auth`

## File yang diubah
- `src/pages/SplashScreen.tsx` — **baru**
- `src/pages/Auth.tsx` — **baru**
- `src/contexts/AppContext.tsx` — tambah user state + localStorage persistence
- `src/App.tsx` — tambah routes
- `src/pages/Index.tsx` — update redirect logic
- `src/pages/Settings.tsx` — tambah logout

