import ProductSection from "./ProductSection";
import productPos from "@/assets/product-pos.png";
import productQr from "@/assets/product-qr.png";
import productKiosk from "@/assets/product-kiosk.svg";
import productQueue from "@/assets/product-queue-hero.png";

const LandingMainProducts = () => {
  return (
    <div className="bg-background">
      <ProductSection
        id="ezpos-pos"
        eyebrow="EZPOS POS"
        title="Yang Dapat EZPOS POS Lakukan untuk Anda"
        description="Sistem kasir modern yang cepat, andal, dan mudah digunakan untuk restoran, kafe, dan warung makan."
        features={[
          "Pembayaran cepat dengan tunai, QRIS, dan e-wallet",
          "Manajemen produk & kategori unlimited",
          "Cetak struk via Bluetooth printer",
          "Laporan penjualan real-time",
          "Bekerja offline saat koneksi terputus",
        ]}
        image={productPos}
        imageAlt="Tampilan aplikasi EZPOS POS pada tablet"
        primaryCta={{ label: "Coba Gratis", to: "/auth" }}
        secondaryCta={{ label: "Lihat Demo", to: "#features" }}
      />

      <ProductSection
        id="ezpos-qr"
        eyebrow="EZPOS QR"
        title="Tingkatkan Proses Pemesanan untuk Bisnis F&B Anda"
        description="Pelanggan memesan langsung dari meja dengan scan QR — tanpa antri, tanpa salah pesan."
        features={[
          "Menu digital interaktif dengan foto produk",
          "Pemesanan dari meja tanpa download aplikasi",
          "Integrasi langsung ke dapur (KDS)",
          "Pembayaran QRIS otomatis",
          "Mengurangi beban kerja waiter hingga 60%",
        ]}
        image={productQr}
        imageAlt="Pelanggan memindai QR menu EZPOS di meja restoran"
        reverse
        imageScale={1.18}
        primaryCta={{ label: "Pelajari Lebih Lanjut", to: "/auth" }}
        secondaryCta={{ label: "Lihat Demo", to: "#features" }}
      />

      <ProductSection
        id="ezpos-kiosk"
        eyebrow="EZPOS Kiosk"
        title="Cara Inovatif & Mudah untuk Self-Service Ordering"
        description="Kiosk pemesanan mandiri yang mempercepat layanan dan meningkatkan rata-rata nilai pesanan."
        features={[
          "Antarmuka layar sentuh yang intuitif",
          "Upselling otomatis dengan rekomendasi menu",
          "Mengurangi antrian di counter kasir",
          "Tersedia dalam multi-bahasa",
        ]}
        image={productKiosk}
        imageAlt="EZPOS Kiosk self-service ordering di restoran"
        primaryCta={{ label: "Pelajari Lebih Lanjut", to: "/auth" }}
        secondaryCta={{ label: "Lihat Demo", to: "#features" }}
      />

      <ProductSection
        id="ezpos-queue"
        eyebrow="EZPOS Queue"
        title="Manajemen Antrian Modern untuk Restoran Anda"
        description="Sistem antrian digital yang membuat pelanggan nyaman menunggu dan staff mudah mengatur giliran."
        features={[
          "Nomor antrian otomatis via WhatsApp",
          "Notifikasi real-time saat giliran tiba",
          "Dashboard monitoring antrian",
          "Estimasi waktu tunggu yang akurat",
        ]}
        image={productQueue}
        imageAlt="Sistem antrian digital EZPOS Queue"
        reverse
        primaryCta={{ label: "Pelajari Lebih Lanjut", to: "/auth" }}
        secondaryCta={{ label: "Lihat Demo", to: "#features" }}
      />
    </div>
  );
};

export default LandingMainProducts;