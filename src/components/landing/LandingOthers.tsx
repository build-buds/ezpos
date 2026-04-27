import { Check, Heart, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import loyaltyMockup from "@/assets/loyalty-mockup.png";

const loyaltyFeatures = [
  "Program poin & cashback otomatis",
  "Member card digital tanpa kartu fisik",
  "Promo & voucher yang dapat dikustomisasi",
  "Notifikasi pelanggan via WhatsApp",
];

const LandingOthers = () => {
  return (
    <section id="others" aria-labelledby="others-title" className="bg-background py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Lainnya</p>
          <h2
            id="others-title"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Bangun <span className="text-primary">Loyalitas</span> & Hubungan dengan Pelanggan
          </h2>
        </div>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="order-1">
            <div className="relative">
              <div className="aspect-[4/3] w-full">
                <img
                  src={loyaltyMockup}
                  alt="Dashboard Loyalty Programme EZPOS"
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Heart className="h-3.5 w-3.5" /> Loyalty Programme
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Tingkatkan Engagement Pelanggan dengan Program Loyalty
            </h3>
            <p className="mt-3 text-muted-foreground">
              Buat pelanggan kembali lagi dan lagi dengan reward yang relevan dan personal.
            </p>
            <ul className="mt-6 space-y-3">
              {loyaltyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cta" size="lg">
                <Link to="/auth">Aktifkan Loyalty</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Heart className="h-3.5 w-3.5" /> CRM
            </div>
            <h4 className="mt-3 font-display text-xl font-bold">Customer Relationship Management</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola data pelanggan, segmentasi, dan kampanye promosi dalam satu dashboard terpadu.
            </p>
          </Card>
          <Card className="p-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Link2 className="h-3.5 w-3.5" /> Biolink
            </div>
            <h4 className="mt-3 font-display text-xl font-bold">Biolink Halaman Bisnis</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Satu link untuk menu digital, sosial media, lokasi, dan kontak bisnis Anda.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LandingOthers;