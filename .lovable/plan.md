

# Fix All Buttons and Navigation

After reviewing every page and component, here are the issues found:

## Issues Found

1. **Settings page menu items** (Profil Akun, Pengaturan Bisnis, Notifikasi, Tampilan) — buttons exist but have no `onClick` handlers; they do nothing when tapped.

2. **Product Edit button** — the pencil icon button on each product card has no handler.

3. **Dashboard "Lihat Semua" button** (Stok Kritis section) — no navigation or action attached.

4. **Dashboard Quick Action "Hutang" button** — navigates to `/reports` but there's no dedicated debt/hutang section.

5. **Console ref warnings** — `MobileLayout` and `Settings` throw "Function components cannot be given refs" warnings because React Router or a parent is passing a ref to them. Need to wrap with `forwardRef`.

## Plan

### Step 1: Fix MobileLayout ref warning
Wrap `MobileLayout` with `React.forwardRef` to suppress the ref warning that cascades to Reports, Settings, and other pages.

### Step 2: Add Settings sub-page navigation
Add `onClick` handlers to the 4 Settings menu items. Since there are no dedicated sub-pages yet, show a toast notification ("Fitur segera hadir") for each item as a placeholder.

### Step 3: Add Product Edit functionality
Wire the Edit button on product cards to open the existing add-product sheet in "edit mode" — pre-fill the form fields and update the product on save instead of creating a new one.

### Step 4: Fix Dashboard action buttons
- "Lihat Semua" on Stok Kritis → navigate to `/products`
- "Hutang" quick action → navigate to `/reports` (keep as-is, acceptable)

### Files to modify
- `src/components/MobileLayout.tsx` — add `forwardRef`
- `src/pages/Settings.tsx` — add toast onClick handlers
- `src/pages/Products.tsx` — add edit product logic
- `src/pages/Dashboard.tsx` — wire "Lihat Semua" button

