import { useAppState } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { isOnboarded } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnboarded) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  }, [isOnboarded, navigate]);

  return null;
};

export default Index;
