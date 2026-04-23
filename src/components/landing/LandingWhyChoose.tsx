import { Sparkles, Headphones, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import whyBg from "@/assets/why-choose-bg.svg";

const reasons = [
  {
    icon: Sparkles,
    title: "POS Sederhana & Andal",
    desc: "Antarmuka yang intuitif dengan performa stabil — staff baru bisa langsung menggunakan tanpa training panjang.",
  },
  {
    icon: Headphones,
    title: "Dukungan Pelanggan Berdedikasi",
    desc: "Tim support EZPOS siap membantu via WhatsApp, email, dan call dengan respons cepat setiap hari.",
  },
  {
    icon: Rocket,
    title: "Berdayakan Bisnis F&B Anda",
    desc: "Fitur lengkap mulai dari kasir, dapur, antrian, hingga loyalty — semua untuk pertumbuhan bisnis Anda.",
  },
];

const LandingWhyChoose = () => {
  return (
    <section
      id="why-choose"
      aria-labelledby="why-choose-title"
      className="relative overflow-hidden bg-muted/30 py-20 md:py-28"
    >
      <img
        src={whyBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/2 hidden w-[500px] -translate-y-1/2 opacity-[0.06] md:block"
      />
      <div className="container relative max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Mengapa EZPOS
            </p>
            <h2
              id="why-choose-title"
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Mengapa Memilih <span className="text-primary">EZPOS?</span>
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Kami membangun EZPOS dengan fokus pada kebutuhan nyata pelaku usaha F&B di Indonesia
              — sederhana, andal, dan berkembang bersama bisnis Anda.
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              return (
                <Card
                  key={r.title}
                  className={`p-6 ${i === 1 ? "md:ml-8" : i === 2 ? "md:ml-4" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingWhyChoose;