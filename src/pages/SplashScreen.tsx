import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

const SplashScreen = () => {
  const { isLoggedIn, isOnboarded, isAuthLoading } = useAppState();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    const t = setTimeout(() => {
      if (isLoggedIn && isOnboarded) {
        navigate("/dashboard", { replace: true });
      } else if (isLoggedIn) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [isAuthLoading, isLoggedIn, isOnboarded, navigate]);

  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center">
      <div className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <img src="/logo.png" alt="EZPOS Logo" className="w-32 h-auto object-contain" />
        <p className="text-sm text-primary-foreground/70">Kelola usahamu lebih mudah</p>
        {isAuthLoading && (
          <Loader2 className="w-6 h-6 text-primary-foreground/50 animate-spin mt-4" />
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
