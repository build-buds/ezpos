import { ChefHat, Store, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";

const businesses = [
  {
    icon: ChefHat,
    title: "Restoran & Kafe",
    desc: "Kelola meja, pesanan dapur, dan menu digital dengan QR code.",
    color: "bg-restoran/10 text-restoran",
  },
  {
    icon: Store,
    title: "Warung Makan",
    desc: "Kasir simpel, catat penjualan harian, dan pantau stok bahan.",
    color: "bg-warung/10 text-warung",
  },
  {
    icon: ShoppingBag,
    title: "Toko Retail",
    desc: "Manajemen produk lengkap dengan barcode dan laporan profit.",
    color: "bg-onlineshop/10 text-onlineshop",
  },
];

const LandingBusiness = () => {
  return (
    <section id="business" className="bg-background py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Cocok untuk <span className="text-primary">semua jenis</span> usaha
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Dari warung pinggir jalan sampai restoran fine dining — EZPOS menyesuaikan dengan kebutuhan Anda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {businesses.map((b) => (
            <Card key={b.title} className="group p-8 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${b.color}`}>
                <b.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">{b.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingBusiness;
