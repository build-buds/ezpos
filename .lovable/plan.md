

## Plan: Konversi EZPOS menjadi PWA

PWA akan membuat EZPOS bisa di-install ke home screen dan memiliki basic offline support. Fitur PWA (install, offline) **hanya bekerja di versi published**, bukan di preview editor Lovable.

### Langkah-langkah:

**1. Buat `public/manifest.json`**
- App name: "EZPOS", short_name: "EZPOS"
- `display: "standalone"`, theme_color & background_color biru (#2563EB)
- Icons: gunakan `logo.png` yang sudah ada (192x192 dan 512x512)
- start_url: "/", scope: "/"

**2. Buat icon PWA** 
- Salin `logo.png` ke `icon-192.png` dan `icon-512.png` di `public/`

**3. Update `index.html`**
- Tambah `<link rel="manifest" href="/manifest.json">`
- Tambah meta tag: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, apple-touch-icon

**4. Install `vite-plugin-pwa` dan konfigurasi di `vite.config.ts`**
- `registerType: "autoUpdate"`
- `devOptions: { enabled: false }` — service worker hanya aktif di production
- `navigateFallbackDenylist: [/^\/~oauth/]`
- Manifest dan icon config

**5. Update `src/main.tsx`** — Tambah guard agar service worker TIDAK register di iframe/preview:
```typescript
const isInIframe = (() => {
  try { return window.self !== window.top; } 
  catch { return true; }
})();
const isPreviewHost = window.location.hostname.includes("id-preview--");
if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then(r => r.forEach(sw => sw.unregister()));
}
```

**6. Buat komponen `InstallPrompt`** 
- Menangkap event `beforeinstallprompt` 
- Menampilkan banner/tombol "Install EZPOS" yang muncul di dashboard
- Untuk iOS: deteksi Safari dan tampilkan instruksi manual (Share → Add to Home Screen)
- Banner bisa di-dismiss dan tidak muncul lagi (simpan di localStorage)

**7. Tambahkan `InstallPrompt` ke halaman Dashboard**

### Catatan penting:
- Service worker dan install prompt **hanya bekerja di versi deployed/published**, bukan di preview Lovable
- Tidak akan mengganggu development di editor

