import { useNavigate } from "react-router-dom";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/contexts/AppContext";
import heroImage from "@/assets/hero-ibu-happy.png";

const LandingHero = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isOnboarded } = useAppState();
  const ctaTarget = isLoggedIn ? (isOnboarded ? "/dashboard" : "/onboarding") : "/auth";

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container max-w-7xl px-4 pt-16 md:px-6 md:pt-24 lg:pt-32">
        <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-6 pb-16 text-center lg:pb-32 lg:text-left">
            <div className="inline-flex items-center gap-2 self-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground lg:self-start">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Platform F&B All-in-One #1 di Indonesia
            </div>

            <h1
              id="hero-title"
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Menyederhanakan{" "}
              <span className="text-primary">Manajemen Restoran</span>, Satu per Satu
            </h1>

            <p className="mx-auto max-w-xl font-sans text-base text-muted-foreground sm:text-lg lg:mx-0">
              Solusi lengkap untuk bisnis F&B Anda — EZPOS POS, QR Ordering, Kiosk
              Self-Service, dan Queue Management dalam satu platform terintegrasi.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button variant="cta" size="lg" className="w-full sm:w-auto" onClick={() => navigate(ctaTarget)}>
                Jadwalkan Demo
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => document.querySelector("#produk")?.scrollIntoView({ behavior: "smooth" })}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Tonton Video
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
              <ShieldCheck className="h-4 w-4 text-success" />
              Tanpa kartu kredit • Setup &lt; 5 menit • Aman & Terenkripsi
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-[680px]">
              <div className="absolute inset-0 -z-10 mx-auto h-full w-full rounded-[3rem] bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 blur-2xl" />
              <div className="absolute right-2 top-4 z-10 rounded-2xl bg-accent px-4 py-2 font-display text-sm font-bold text-accent-foreground shadow-lg sm:right-6 sm:top-8 md:px-5 md:py-2.5 md:text-base">
                100% Gratis
              </div>
              <img
                src={heroImage}
                alt="Pelaku usaha Indonesia menggunakan EZPOS"
                className="relative z-0 block h-auto w-full object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
