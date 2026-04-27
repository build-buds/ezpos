import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Kebijakan Privasi — EZPOS"
        description="Pelajari bagaimana EZPOS mengumpulkan, menggunakan, dan melindungi data pribadi serta data bisnis Anda sesuai standar privasi yang berlaku."
        path="/privacy"
      />
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Kembali" className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Kebijakan Privasi</h1>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-6 prose prose-sm text-foreground">
        <p className="text-muted-foreground text-xs">Terakhir diperbarui: 12 April 2026</p>

        <h2 className="text-base font-bold mt-6">1. Informasi yang Kami Kumpulkan</h2>
        <p>Kami mengumpulkan informasi berikut saat Anda menggunakan EZPOS:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Informasi Akun:</strong> Email, nama, dan informasi profil yang Anda berikan saat mendaftar</li>
          <li><strong>Informasi Bisnis:</strong> Nama bisnis, kategori, alamat, dan nomor telepon</li>
          <li><strong>Data Transaksi:</strong> Catatan penjualan, produk, dan laporan yang Anda buat</li>
          <li><strong>Data Teknis:</strong> Jenis perangkat, sistem operasi, dan log aktivitas</li>
        </ul>

        <h2 className="text-base font-bold mt-6">2. Penggunaan Informasi</h2>
        <p>Informasi Anda digunakan untuk:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Menyediakan dan meningkatkan layanan EZPOS</li>
          <li>Mengelola akun dan autentikasi Anda</li>
          <li>Mengirim notifikasi terkait layanan (stok rendah, laporan)</li>
          <li>Menganalisis penggunaan untuk perbaikan layanan</li>
        </ul>

        <h2 className="text-base font-bold mt-6">3. Penyimpanan Data</h2>
        <p>Data Anda disimpan secara aman di server cloud dengan enkripsi. Kami menerapkan langkah-langkah keamanan teknis dan organisasional untuk melindungi data Anda dari akses yang tidak sah.</p>

        <h2 className="text-base font-bold mt-6">4. Berbagi Data</h2>
        <p>Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Data hanya dibagikan dalam kondisi berikut:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Dengan persetujuan eksplisit Anda</li>
          <li>Untuk memenuhi kewajiban hukum</li>
          <li>Dengan penyedia layanan terpercaya yang membantu operasional kami</li>
        </ul>

        <h2 className="text-base font-bold mt-6">5. Hak Pengguna</h2>
        <p>Anda memiliki hak untuk:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Mengakses data pribadi Anda</li>
          <li>Memperbarui atau mengoreksi informasi yang tidak akurat</li>
          <li>Meminta penghapusan akun dan data Anda</li>
          <li>Menarik persetujuan penggunaan data</li>
        </ul>

        <h2 className="text-base font-bold mt-6">6. Cookie dan Penyimpanan Lokal</h2>
        <p>EZPOS menggunakan penyimpanan lokal (localStorage) untuk menyimpan preferensi dan sesi pengguna. Ini diperlukan untuk fungsi dasar aplikasi.</p>

        <h2 className="text-base font-bold mt-6">7. Keamanan</h2>
        <p>Kami menggunakan praktik keamanan standar industri termasuk enkripsi data, autentikasi aman, dan pemantauan keamanan berkelanjutan.</p>

        <h2 className="text-base font-bold mt-6">8. Perubahan Kebijakan</h2>
        <p>Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui aplikasi.</p>

        <h2 className="text-base font-bold mt-6">9. Kontak</h2>
        <p>Untuk pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui fitur bantuan di dalam aplikasi.</p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
