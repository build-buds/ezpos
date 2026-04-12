import { Navigate } from "react-router-dom";
import { useAppState } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthLoading, isLoggedIn, isOnboarded, isBusinessDataLoaded } = useAppState();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Wait for business data before redirecting
  if (isLoggedIn && !isBusinessDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoggedIn && isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoggedIn && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;