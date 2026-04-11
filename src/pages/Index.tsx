import { useAppState } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { isLoggedIn, isOnboarded, isAuthLoading } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return;
    if (isLoggedIn && isOnboarded) {
      navigate("/dashboard", { replace: true });
    } else if (isLoggedIn) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/auth", { replace: true });
    }
  }, [isLoggedIn, isOnboarded, isAuthLoading, navigate]);

  return null;
};

export default Index;
