import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MODULES } from "@/data/modules";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Modules = () => {
  const navigate = useNavigate();

  const active = MODULES.filter((m) => m.status === "active");
  const comingSoon = MODULES.filter((m) => m.status === "coming-soon");

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-6 text-primary-foreground bg-primary">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-bold">Modul EZPOS</h1>
        </div>
        <p className="mt-1 text-xs opacity-80">
          Semua fitur EZPOS dalam satu tempat. Aktifkan modul sesuai kebutuhan bisnis Anda.
        </p>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-4 space-y-6 lg:max-w-5xl lg:mx-auto pb-8">
        {active.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-foreground mb-3">Aktif</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {active.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.slug}
                    onClick={() => m.path && navigate(m.path)}
                    className="text-left bg-card rounded-2xl p-4 card-shadow hover:scale-[1.02] transition-transform flex items-start gap-3"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.short}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Segera Hadir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comingSoon.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.slug}
                  onClick={() => navigate(`/modules/${m.slug}`)}
                  className="text-left bg-card rounded-2xl p-4 card-shadow hover:shadow-md transition-shadow flex items-start gap-3 relative overflow-hidden"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">{m.name}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Segera Hadir
                      </Badge>
                      {m.isPro && (
                        <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.short}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-3" />
                </button>
              );
            })}
          </div>
        </section>

        <Card className="p-5 bg-primary/5 border-primary/20">
          <p className="text-sm font-semibold text-foreground">Punya saran modul?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Kami bangun EZPOS berdasarkan kebutuhan nyata pelaku usaha F&B Indonesia. Hubungi tim kami via halaman Kontak untuk request fitur.
          </p>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Modules;