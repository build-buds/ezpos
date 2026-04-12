import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Crown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";
import { toast } from "sonner";

const POLAR_PRODUCT_ID = "b5ab8339-8495-488b-b487-0a4502740459";

type CheckoutResponse = {
  url?: string;
  error?: string;
  code?: string;
};

const freePlanFeatures = [
  "50 produk",
  "100 transaksi/bulan",
  "1 perangkat",
  "Laporan dasar",
];

const proPlanFeatures = [
  "Unlimited produk",
  "Unlimited transaksi",
  "3 perangkat",
  "Laporan lengkap + export",
  "Manajemen stok lanjutan",
  "Dukungan prioritas",
];

const createPolarCheckout = async (accessToken: string, payload: { productId: string; successUrl: string }) => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-polar-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  let result: CheckoutResponse | null = null;

  try {
    result = (await response.json()) as CheckoutResponse;
  } catch {
    result = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    result,
  };
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAppState();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let accessToken = session?.access_token;

      if (!accessToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error("Failed to refresh session before checkout:", refreshError);
        }

        accessToken = refreshData.session?.access_token;
      }

      if (!accessToken) {
        toast.error("Sesi login tidak valid. Silakan login ulang.");
        navigate("/auth");
        return;
      }

      const successUrl = `${window.location.origin}/checkout/success?checkout_id={CHECKOUT_ID}`;

      const { ok, status, result } = await createPolarCheckout(accessToken, {
        productId: POLAR_PRODUCT_ID,
        successUrl,
      });

      if (!ok) {
        const message = result?.error || `Checkout service error (${status})`;
        console.error("Checkout function error:", { status, result });
        toast.error(message);

        if (status === 401) {
          navigate("/auth");
        }

        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error("Tidak ada URL checkout dari server.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membuat checkout. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="bg-primary px-5 md:px-8 pt-10 pb-6 text-primary-foreground">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-4 opacity-80">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali</span>
        </button>
        <h1 className="text-lg md:text-xl font-bold">Pilih Paket</h1>
        <p className="text-sm opacity-80 mt-1">Tingkatkan bisnis Anda dengan EZPOS Pro</p>
      </div>

      <div className="px-5 md:px-8 py-6 space-y-4">
        {/* Free Plan */}
        <Card className="border-2 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Gratis</CardTitle>
            </div>
            <p className="text-2xl font-bold mt-2">
              Rp 0<span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {freePlanFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-muted-foreground" />
                <span>{f}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" disabled>
              Paket Saat Ini
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-2 border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0">
            <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
              Populer
            </Badge>
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Pro</CardTitle>
            </div>
            <p className="text-2xl font-bold mt-2">
              Rp 299.000<span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {proPlanFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>{f}</span>
              </div>
            ))}
            <Button className="w-full mt-4" onClick={handleUpgrade} disabled={loading}>
              {loading ? "Memproses..." : "Upgrade ke Pro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Pricing;
