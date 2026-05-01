export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  image?: string;
  tags: string[];
  readTime: number;
}

const blogPosts: BlogPost[] = [
  {
    slug: "cara-memilih-aplikasi-kasir-restoran",
    title: "Cara Memilih Aplikasi Kasir Restoran yang Tepat untuk Bisnis F&B Anda",
    description:
      "Panduan lengkap memilih aplikasi kasir POS restoran: fitur wajib, perbandingan harga, dan tips agar tidak salah pilih sistem kasir untuk usaha makanan.",
    content: `
<p>Memilih aplikasi kasir restoran yang tepat bisa jadi perbedaan antara operasional yang lancar dan kekacauan sehari-hari. Dengan banyaknya pilihan di pasaran, bagaimana Anda menentukan mana yang paling cocok?</p>

<h2>1. Kenali Kebutuhan Bisnis Anda</h2>
<p>Sebelum membandingkan fitur, mulailah dengan memahami skala bisnis Anda. Warung makan kecil tentu punya kebutuhan berbeda dengan restoran besar yang punya banyak cabang.</p>
<ul>
  <li><strong>Volume transaksi harian</strong> — Berapa banyak order per hari?</li>
  <li><strong>Jumlah menu</strong> — Apakah menu Anda sering berubah?</li>
  <li><strong>Jumlah karyawan</strong> — Siapa saja yang akan menggunakan sistem?</li>
  <li><strong>Metode pembayaran</strong> — Cash, QRIS, e-wallet, atau semua?</li>
</ul>

<h2>2. Fitur Wajib yang Harus Ada</h2>
<p>Aplikasi kasir modern harus punya fitur-fitur berikut:</p>
<ul>
  <li><strong>Manajemen menu & produk</strong> dengan foto dan kategori</li>
  <li><strong>Laporan penjualan real-time</strong> harian, mingguan, bulanan</li>
  <li><strong>Multi metode pembayaran</strong> termasuk QRIS</li>
  <li><strong>Mode offline</strong> agar tetap bisa transaksi saat internet mati</li>
  <li><strong>QR Ordering</strong> untuk mengurangi antrian dan kesalahan order</li>
</ul>

<h2>3. Pertimbangkan Biaya Total</h2>
<p>Jangan hanya lihat harga langganan bulanan. Pertimbangkan juga biaya hardware, biaya transaksi, dan apakah ada biaya tersembunyi saat upgrade.</p>
<p>EZPOS misalnya menawarkan paket gratis selamanya untuk kasir dasar, dengan upgrade ke Pro mulai Rp 299.000/bulan untuk fitur lengkap seperti QR ordering, kiosk, dan antrian digital.</p>

<h2>4. Kemudahan Penggunaan</h2>
<p>Sistem kasir terbaik adalah yang bisa dipelajari karyawan baru dalam hitungan menit. Cari yang punya antarmuka intuitif dan tidak butuh pelatihan berhari-hari.</p>

<h2>Kesimpulan</h2>
<p>Pilih aplikasi kasir yang sesuai skala bisnis, punya fitur lengkap, transparan soal harga, dan mudah digunakan. Coba gratis dulu sebelum berkomitmen langganan.</p>
`,
    date: "2026-04-28",
    author: "EZPOS Team",
    tags: ["Kasir", "Restoran", "Tips"],
    readTime: 5,
  },
  {
    slug: "manfaat-qr-ordering-untuk-restoran",
    title: "5 Manfaat QR Ordering untuk Restoran: Hemat Waktu & Tingkatkan Penjualan",
    description:
      "Pelajari bagaimana QR ordering bisa membantu restoran mengurangi antrian, meminimalkan kesalahan pesanan, dan meningkatkan revenue hingga 20%.",
    content: `
<p>QR ordering atau pemesanan via QR code semakin populer di restoran-restoran Indonesia. Tapi apakah benar-benar efektif? Berikut 5 manfaat utamanya.</p>

<h2>1. Mengurangi Antrian & Waktu Tunggu</h2>
<p>Pelanggan bisa langsung scan QR code di meja dan pesan sendiri tanpa harus menunggu pelayan. Ini sangat efektif saat jam sibuk.</p>

<h2>2. Meminimalkan Kesalahan Pesanan</h2>
<p>Karena pelanggan memilih sendiri menu dari smartphone, tidak ada miskomunikasi antara pelanggan dan pelayan. Order langsung masuk ke dapur dengan akurat.</p>

<h2>3. Meningkatkan Average Order Value</h2>
<p>Studi menunjukkan bahwa pelanggan yang memesan sendiri cenderung memesan lebih banyak. Dengan foto menu yang menarik dan rekomendasi upsell, average order value bisa naik 15-20%.</p>

<h2>4. Efisiensi Tenaga Kerja</h2>
<p>Dengan QR ordering, Anda bisa mengalokasikan pelayan untuk tugas lain seperti menyajikan makanan dan memastikan kepuasan pelanggan, bukan sekadar mencatat pesanan.</p>

<h2>5. Data & Insight Pelanggan</h2>
<p>Sistem QR ordering yang baik mencatat semua data pesanan. Anda bisa tahu menu paling populer, jam sibuk, dan tren penjualan untuk membuat keputusan bisnis lebih baik.</p>

<h2>Cara Mulai Menggunakan QR Ordering</h2>
<p>Dengan EZPOS, Anda bisa mengaktifkan QR ordering dalam hitungan menit. Cukup upload menu, cetak QR code untuk setiap meja, dan pelanggan langsung bisa memesan dari smartphone mereka.</p>
`,
    date: "2026-04-20",
    author: "EZPOS Team",
    tags: ["QR Ordering", "Restoran", "Teknologi"],
    readTime: 4,
  },
  {
    slug: "tips-manajemen-antrian-restoran",
    title: "Tips Manajemen Antrian Restoran: Kurangi Waktu Tunggu & Tingkatkan Kepuasan",
    description:
      "Pelajari strategi manajemen antrian digital untuk restoran agar pelanggan tidak perlu menunggu lama dan pengalaman makan lebih menyenangkan.",
    content: `
<p>Antrian panjang adalah salah satu alasan utama pelanggan meninggalkan restoran. Bagaimana cara mengelola antrian dengan lebih baik?</p>

<h2>1. Gunakan Sistem Antrian Digital</h2>
<p>Ganti papan tulis atau kertas antrian dengan sistem digital. Pelanggan bisa mengambil nomor antrian dari smartphone dan memantau giliran mereka secara real-time.</p>

<h2>2. Estimasi Waktu Tunggu yang Akurat</h2>
<p>Sistem antrian modern bisa menghitung estimasi waktu tunggu berdasarkan data historis. Ini membantu pelanggan memutuskan apakah mau menunggu atau tidak.</p>

<h2>3. Notifikasi Otomatis</h2>
<p>Kirim notifikasi ke smartphone pelanggan saat giliran mereka hampir tiba. Mereka bisa menunggu di tempat lain tanpa khawatir terlewat.</p>

<h2>4. Analisis Data Antrian</h2>
<p>Pantau pola antrian untuk menentukan:</p>
<ul>
  <li>Jam-jam sibuk yang butuh staff ekstra</li>
  <li>Rata-rata waktu tunggu per pelanggan</li>
  <li>Tingkat abandonment (pelanggan yang pergi karena terlalu lama)</li>
</ul>

<h2>5. Kombinasikan dengan Self-Ordering</h2>
<p>Saat pelanggan menunggu giliran, biarkan mereka melihat menu dan mempersiapkan pesanan via QR code. Begitu duduk, pesanan langsung bisa diproses.</p>

<h2>Solusi Antrian Digital EZPOS</h2>
<p>EZPOS menyediakan modul antrian digital yang terintegrasi langsung dengan POS dan QR ordering. Pelanggan cukup scan QR code untuk mengambil nomor antrian, dan Anda bisa memantau semuanya dari satu dashboard.</p>
`,
    date: "2026-04-15",
    author: "EZPOS Team",
    tags: ["Antrian", "Manajemen", "Restoran"],
    readTime: 4,
  },
];

export default blogPosts;