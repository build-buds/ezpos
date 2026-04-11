import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/contexts/AppContext";
import { Store } from "lucide-react";

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
      <div className={`flex flex-col items-center gap-4 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <div className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
          <Store className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight">EZPOS</h1>
        <p className="text-sm text-primary-foreground/70">Kelola usahamu lebih mudah</p>
      </div>
    </div>
  );
};

export default SplashScreen;
