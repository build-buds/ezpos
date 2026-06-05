import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
  }
}

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Pemilik Warung Makan Berkah",
    text: "Sebelum pakai EZPOS, catat penjualan masih manual. Sekarang semua otomatis dan saya bisa lihat laporan dari HP.",
  },
  {
    name: "Siti Nurhaliza",
    role: "Owner Kafe Senja",
    text: "Menu digital QR-nya keren! Pelanggan bisa pesan langsung tanpa nunggu pelayan. Order naik 30%.",
  },
  {
    name: "Andi Pratama",
    role: "Restoran Padang Marawa",
    text: "Aplikasinya ringan, ga lemot, dan bisa dipakai offline pas wifi mati. Highly recommended.",
  },
];

const LandingTestimonials = () => {
  const trustpilotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trustpilotRef.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(trustpilotRef.current, true);
    }
  }, []);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Dipercaya oleh <span className="text-primary">ribuan pelaku usaha</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.text}"</p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <div
            ref={trustpilotRef}
            className="trustpilot-widget"
            data-locale="en-US"
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="6a22c2d3248cdf89b0e2a121"
            data-style-height="55"
            data-style-width="100%"
            data-token="c26f7093-b9f5-44ec-a5c2-f1d8c5c3f501"
          >
            <a href="https://www.trustpilot.com/review/ezpos.id" target="_blank" rel="noopener">
              Trustpilot
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
