import { ShoppingCart, Package, BarChart3, QrCode, WifiOff, Bell } from "lucide-react";

const features = [
  { icon: ShoppingCart, title: "Kasir POS Cepat", desc: "Proses transaksi dalam hitungan detik dengan UI yang dirancang untuk mobile." },
  { icon: Package, title: "Manajemen Produk", desc: "CRUD produk lengkap dengan foto, kategori, dan tracking stok otomatis." },
  { icon: BarChart3, title: "Laporan Real-time", desc: "Pantau pendapatan, produk terlaris, dan tren penjualan kapan saja." },
  { icon: QrCode, title: "Menu Digital", desc: "Bagikan menu Anda via QR code — pelanggan order langsung dari HP mereka." },
  { icon: WifiOff, title: "Mode Offline", desc: "Tetap bisa jualan walau internet putus, data otomatis sinkron saat online." },
  { icon: Bell, title: "Notifikasi Pintar", desc: "Web push notification untuk pesanan baru, stok menipis, dan laporan harian." },
];

const LandingFeatures = () => {
  return (
    <section id="features" className="bg-muted/30 py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Fitur Lengkap</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Semua yang Anda butuhkan, <br />
            <em className="text-primary">dalam satu aplikasi</em>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
