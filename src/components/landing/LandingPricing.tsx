import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/contexts/AppContext";

const plans = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "/bulan",
    desc: "Cocok untuk usaha yang baru mulai.",
    features: [
      "50 produk",
      "100 transaksi/bulan",
      "1 perangkat",
      "Laporan dasar",
    ],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Rp 500.000",
    period: "/bulan",
    desc: "Untuk bisnis yang ingin tumbuh lebih cepat.",
    features: [
      "Unlimited produk",
      "Unlimited transaksi",
      "3 perangkat",
      "Laporan lengkap + export",
      "Manajemen stok lanjutan",
      "Dukungan prioritas",
    ],
    cta: "Upgrade ke Pro",
    highlighted: true,
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAppState();

  const handleClick = (highlighted: boolean) => {
    if (!isLoggedIn) navigate("/auth");
    else navigate(highlighted ? "/pricing" : "/dashboard");
  };

  return (
    <section id="pricing" className="bg-muted/30 py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Harga</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Pilih paket yang <span className="text-primary">tepat</span> untuk Anda
          </h2>
          <p className="mt-4 text-muted-foreground">Tanpa biaya tersembunyi. Batalkan kapan saja.</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${plan.highlighted ? "border-2 border-primary shadow-2xl" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
                  PALING POPULER
                </div>
              )}
              <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "cta" : "outline"}
                size="lg"
                className="mt-8 w-full"
                onClick={() => handleClick(plan.highlighted)}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
