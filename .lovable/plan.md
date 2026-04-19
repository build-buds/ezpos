
User wants:
1. Digital menu yang fully managed oleh owner (CRUD menu, harga, tema)
2. Public read-only view untuk customer via QR
3. Download PDF "table tent" siap cetak (nama bisnis, title, deskripsi, logo, QR di tengah)

Owner sudah punya CRUD products via halaman Products. Yang baru dibutuhkan:
- Slug + toggle publish + tema settings
- Halaman publik /menu/:slug
- PDF generator dengan QR

Tema: cukup pilih preset (3-4 opsi) + accent color, biar simpel dulu. Bisa di-extend nanti.

PDF: pakai jsPDF + qrcode (data URL) — ringan, no server needed.

Flow diagram inline ASCII cukup.

Keep it concise per instructions.
