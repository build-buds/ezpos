

# Rapikan Warning Dev — Sederhanakan App Wrapper

## Masalah
1. **`TooltipProvider` tidak dipakai** — Tidak ada komponen di pages atau layout yang menggunakan Tooltip. Provider ini bisa dihapus dari `App.tsx`.
2. **`forwardRef` di `MobileLayout` dan `BottomNav` tidak diperlukan** — Tidak ada parent yang secara eksplisit meneruskan ref ke komponen ini. `forwardRef` ditambahkan sebelumnya untuk menekan warning, tapi solusi yang lebih bersih adalah menghapusnya dan memastikan tidak ada ref yang diteruskan.
3. **Dual Toaster** — App menggunakan `Toaster` (radix) dan `Sonner` sekaligus. Perlu konfirmasi mana yang benar-benar dipakai.

## Rencana

### Step 1: Hapus `TooltipProvider` dari App.tsx
Hapus import dan wrapper `TooltipProvider` — tidak ada halaman yang memakai Tooltip.

### Step 2: Sederhanakan `MobileLayout` dan `BottomNav`
Ubah kembali ke function component biasa (tanpa `forwardRef`) karena tidak ada parent yang meneruskan ref.

### Step 3: Audit Toaster usage
Cek apakah `toast()` dari radix atau `sonner` yang dipakai di pages, lalu hapus yang tidak terpakai dari App.

### File yang diubah
- `src/App.tsx` — hapus TooltipProvider, mungkin hapus salah satu Toaster
- `src/components/MobileLayout.tsx` — hapus forwardRef
- `src/components/BottomNav.tsx` — hapus forwardRef

