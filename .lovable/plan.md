## Masalah

Dari log auth:
- Signup `hibuildbuds@gmail.com` **berhasil** (akun sudah dibuat).
- Login langsung setelahnya **gagal** dengan error `email_not_confirmed` — project mewajibkan konfirmasi email, tapi user belum mengklik link konfirmasi di inbox.

## Solusi

Aktifkan **auto-confirm email** di Lovable Cloud Auth, sehingga user langsung bisa login setelah signup tanpa harus cek email. Cocok untuk MVP EZPOS yang butuh onboarding cepat.

## Langkah

1. **Configure Auth**: `auto_confirm_email: true` (HIBP password check tetap aktif, signup tetap terbuka, anonymous tetap mati).
2. **Aktifkan user yang sudah ada**: update `auth.users` set `email_confirmed_at = now()` untuk `hibuildbuds@gmail.com` agar bisa langsung login dengan password `Budiman01@@-`.
3. **Assign admin role**: insert ke `user_roles` (role `admin`) untuk user tersebut, sesuai permintaan dashboard admin sebelumnya.

## Tidak diubah

- Tidak menyentuh frontend Auth.tsx.
- Tidak menonaktifkan HIBP / membuka anonymous signup.
- Tidak menyetup custom email domain (bisa dilakukan terpisah jika nanti mau kirim email branded).

Setelah ini selesai, user `hibuildbuds@gmail.com` langsung bisa login dan mengakses `/admin`.
