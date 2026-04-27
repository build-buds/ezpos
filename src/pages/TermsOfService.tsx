import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Syarat & Ketentuan — EZPOS"
        description="Baca syarat dan ketentuan penggunaan layanan EZPOS, aplikasi kasir POS dan manajemen F&B untuk usaha di Indonesia."
        path="/terms"
      />
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Kembali" className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Syarat & Ketentuan</h1>
      </header>
      <main className="max-w-2xl mx-auto px-5 py-6 prose prose-sm text-foreground">
        <p className="text-muted-foreground text-xs">Terakhir diperbarui: 12 April 2026</p>

        <h2 className="text-base font-bold mt-6">1. Penerimaan Syarat</h2>
        <p>Dengan mengakses dan menggunakan aplikasi EZPOS, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui syarat ini, mohon untuk tidak menggunakan layanan kami.</p>

        <h2 className="text-base font-bold mt-6">2. Deskripsi Layanan</h2>
        <p>EZPOS adalah aplikasi Point of Sale (POS) yang menyediakan layanan manajemen penjualan, inventaris produk, dan pelaporan bisnis untuk usaha kecil dan menengah.</p>

        <h2 className="text-base font-bold mt-6">3. Akun Pengguna</h2>
        <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk memberikan informasi yang akurat dan terkini saat mendaftar. Setiap aktivitas yang terjadi di bawah akun Anda menjadi tanggung jawab Anda.</p>

        <h2 className="text-base font-bold mt-6">4. Penggunaan yang Diizinkan</h2>
        <p>Anda setuju untuk menggunakan EZPOS hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Anda dilarang:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Menggunakan layanan untuk aktivitas ilegal</li>
          <li>Mencoba mengakses sistem tanpa izin</li>
          <li>Mengganggu atau merusak layanan</li>
          <li>Menyebarkan malware atau konten berbahaya</li>
        </ul>

        <h2 className="text-base font-bold mt-6">5. Data dan Privasi</h2>
        <p>Penggunaan data Anda diatur oleh Kebijakan Privasi kami. Dengan menggunakan EZPOS, Anda menyetujui pengumpulan dan penggunaan data sesuai kebijakan tersebut.</p>

        <h2 className="text-base font-bold mt-6">6. Ketersediaan Layanan</h2>
        <p>Kami berusaha menyediakan layanan 24/7, namun tidak menjamin ketersediaan tanpa gangguan. Kami berhak melakukan pemeliharaan atau pembaruan yang dapat menyebabkan gangguan sementara.</p>

        <h2 className="text-base font-bold mt-6">7. Batasan Tanggung Jawab</h2>
        <p>EZPOS disediakan "sebagaimana adanya". Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan ini.</p>

        <h2 className="text-base font-bold mt-6">8. Perubahan Syarat</h2>
        <p>Kami berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diberitahukan melalui aplikasi. Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui syarat yang diperbarui.</p>

        <h2 className="text-base font-bold mt-6">9. Kontak</h2>
        <p>Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui fitur bantuan di dalam aplikasi.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
