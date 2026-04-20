import { useNavigate } from "react-router-dom";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/contexts/AppContext";

const LandingHero = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isOnboarded } = useAppState();
  const ctaTarget = isLoggedIn ? (isOnboarded ? "/dashboard" : "/onboarding") : "/auth";

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 self-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground lg:self-start">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Platform Kasir & Manajemen Bisnis #1
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-primary">#SelaluAda</span>
              <br />
              Bersama Pelaku <br className="hidden sm:block" />
              Usaha <span className="text-primary">Indonesia</span>
            </h1>

            <p className="mx-auto max-w-xl font-sans text-base text-muted-foreground sm:text-lg lg:mx-0">
              Kelola restoran, warung, dan toko Anda dalam satu aplikasi. Kasir cepat, laporan real-time, menu digital — semuanya di EZPOS.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button variant="cta" size="lg" className="w-full sm:w-auto" onClick={() => navigate(ctaTarget)}>
                Coba Gratis Sekarang
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Lihat Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
              <ShieldCheck className="h-4 w-4 text-success" />
              Tanpa kartu kredit • Setup &lt; 5 menit • Aman & Terenkripsi
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[4/5] max-w-md rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/70 p-8 shadow-2xl">
              <div className="absolute -top-4 -right-4 rounded-2xl bg-accent px-4 py-2 font-display text-sm font-bold text-accent-foreground shadow-lg">
                100% Gratis
              </div>
              <div className="flex h-full flex-col justify-between rounded-2xl bg-card/95 p-6 backdrop-blur">
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">Pendapatan Hari Ini</p>
                  <p className="mt-2 font-display text-4xl font-bold text-foreground">Rp 4.250K</p>
                  <p className="mt-1 text-sm text-success">+18% dari kemarin</p>
                </div>
                <div className="my-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Transaksi</p>
                    <p className="font-display text-2xl font-bold">87</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Produk Terjual</p>
                    <p className="font-display text-2xl font-bold">214</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium">Nasi Goreng</span>
                    <span className="text-sm font-semibold">42x</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-sm font-medium">Es Teh Manis</span>
                    <span className="text-sm font-semibold">38x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
