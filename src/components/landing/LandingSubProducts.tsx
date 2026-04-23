import { Card } from "@/components/ui/card";
import subKds from "@/assets/sub-kds.svg";
import subEds from "@/assets/sub-eds.svg";
import subPda from "@/assets/sub-pda.svg";
import subPrinter from "@/assets/sub-printer.svg";

const items = [
  {
    name: "KDS",
    title: "Kitchen Display System",
    desc: "Tampilan dapur digital untuk menerima dan memproses pesanan secara real-time tanpa kertas.",
    image: subKds,
    alt: "Layar Kitchen Display System EZPOS di dapur",
  },
  {
    name: "EDS",
    title: "Expo Display System",
    desc: "Display ekspedisi pesanan untuk koordinasi antara dapur dan pelayan dengan akurat.",
    image: subEds,
    alt: "Layar Expo Display System EZPOS",
  },
  {
    name: "PDA",
    title: "Waiter Order Device",
    desc: "Perangkat genggam untuk waiter mengambil pesanan langsung di meja pelanggan.",
    image: subPda,
    alt: "Perangkat genggam pelayan EZPOS PDA",
  },
  {
    name: "Cloud Printer",
    title: "Printer Berbasis Cloud",
    desc: "Cetak struk dan tiket dapur dari mana saja melalui jaringan tanpa kabel langsung.",
    image: subPrinter,
    alt: "Cloud Printer EZPOS",
  },
];

const LandingSubProducts = () => {
  return (
    <section
      id="sub-products"
      aria-labelledby="sub-products-title"
      className="bg-muted/30 py-20 md:py-28"
    >
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Sub Produk
          </p>
          <h2
            id="sub-products-title"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Lengkapi Operasional Anda dengan{" "}
            <span className="text-primary">Perangkat Pendukung</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Solusi hardware & software tambahan untuk efisiensi maksimal di seluruh lini operasional.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.name} className="overflow-hidden p-0">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {item.name}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSubProducts;