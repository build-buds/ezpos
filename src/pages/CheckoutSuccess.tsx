import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "succeeded" | "failed" | "pending_doku";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const checkoutId = searchParams.get("checkout_id");
    const invoice = searchParams.get("invoice");
    const failed = searchParams.get("status") === "failed";

    if (failed) {
      setStatus("failed");
      return;
    }

    // DOKU flow: webhook activates the subscription server-side
    if (invoice && !checkoutId) {
      setStatus("pending_doku");
      // Poll subscription for ~60s to auto-redirect once webhook lands
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("plan, status")
            .eq("user_id", user.id)
            .maybeSingle();
          if (sub?.plan === "pro" && sub?.status === "active") {
            setStatus("succeeded");
            clearInterval(interval);
            setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
            return;
          }
        }
        if (attempts >= 30) clearInterval(interval);
      }, 2000);
      return () => clearInterval(interval);
    }

    // Polar flow
    if (!checkoutId) {
      setStatus("failed");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-polar-checkout", {
          body: { checkoutId },
        });
        if (error) throw error;
        if (data?.status === "succeeded") {
          setStatus("succeeded");
          setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };
    verify();
  }, [searchParams, navigate]);

  return (
    <MobileLayout>
      <div className="flex items-center justify-center min-h-[80vh] px-5">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Memverifikasi pembayaran...</p>
              </>
            )}
            {status === "pending_doku" && (
              <>
                <Clock className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-lg font-bold">Pembayaran Sedang Diproses</h2>
                <p className="text-sm text-muted-foreground">
                  Setelah pembayaran berhasil di DOKU, akun Anda akan otomatis di-upgrade ke Pro dalam 1-2 menit.
                  Halaman ini akan refresh secara otomatis.
                </p>
                <Loader2 className="w-5 h-5 mx-auto text-muted-foreground animate-spin" />
              </>
            )}
            {status === "succeeded" && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-lg font-bold">Pembayaran Berhasil!</h2>
                <p className="text-sm text-muted-foreground">
                  Selamat! Anda sekarang menggunakan EZPOS Pro. Mengalihkan ke dashboard...
                </p>
              </>
            )}
            {status === "failed" && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <h2 className="text-lg font-bold">Pembayaran Gagal</h2>
                <p className="text-sm text-muted-foreground">
                  Terjadi kesalahan. Silakan coba lagi.
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default CheckoutSuccess;
