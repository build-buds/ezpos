import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { getModule } from "@/data/modules";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";
import { toast } from "sonner";

const ModuleDetail = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAppState();
  const mod = getModule(slug);

  const [interested, setInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !mod) {
      setChecking(false);
      return;
    }
    let active = true;
    supabase
      .from("module_interests")
      .select("id")
      .eq("user_id", user.id)
      .eq("module_slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setInterested(!!data);
        setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [user, slug, mod]);

  if (!mod) {
    return (
      <MobileLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Modul tidak ditemukan</p>
          <Button className="mt-4" onClick={() => navigate("/modules")}>Kembali</Button>
        </div>
      </MobileLayout>
    );
  }

  const Icon = mod.icon;

  const handleNotify = async () => {
    if (!user) {
      toast.error("Login dulu untuk mendaftar minat");
      return;
    }
    setLoading(true);
    if (interested) {
      const { error } = await supabase
        .from("module_interests")
        .delete()
        .eq("user_id", user.id)
        .eq("module_slug", slug);
      setLoading(false);
      if (error) {
        toast.error("Gagal membatalkan");
        return;
      }
      setInterested(false);
      toast.success("Pendaftaran minat dibatalkan");
    } else {
      const { error } = await supabase
        .from("module_interests")
        .insert({ user_id: user.id, module_slug: slug });
      setLoading(false);
      if (error) {
        toast.error("Gagal mendaftar");
        return;
      }
      setInterested(true);
      toast.success("Kami akan kabari saat modul ini rilis!");
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-8 text-primary-foreground bg-primary">
        <button
          onClick={() => navigate("/modules")}
          className="inline-flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Semua modul
        </button>
        <div className="flex items-start gap-4 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold">{mod.name}</h1>
              {mod.status === "coming-soon" && (
                <Badge variant="secondary" className="text-[10px]">Segera Hadir</Badge>
              )}
              {mod.isPro && (
                <Badge className="text-[10px] bg-primary-foreground text-primary">Pro</Badge>
              )}
            </div>
            <p className="text-sm opacity-90 mt-1">{mod.short}</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-6 space-y-5 lg:max-w-3xl lg:mx-auto pb-8">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-foreground">Tentang Modul Ini</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {mod.description}
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-foreground">Yang Akan Anda Dapatkan</h2>
          <ul className="mt-3 space-y-2.5">
            {mod.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                <span className="text-foreground/90">{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        {mod.status === "coming-soon" && (
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <BellRing className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  Modul ini sedang dalam pengembangan
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Daftar di bawah untuk mendapat notifikasi prioritas saat modul ini siap dipakai. Pendaftar awal mendapat akses early-bird.
                </p>
                <Button
                  className="mt-4 w-full sm:w-auto"
                  variant={interested ? "outline" : "cta"}
                  size="lg"
                  onClick={handleNotify}
                  disabled={loading || checking || !user}
                >
                  {loading || checking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : interested ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Sudah Terdaftar — Batalkan
                    </>
                  ) : (
                    <>
                      <BellRing className="w-4 h-4 mr-2" /> Notify Saya Saat Rilis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default ModuleDetail;