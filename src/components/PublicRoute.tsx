import { Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAppState } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthLoading, isLoggedIn, isOnboarded, isBusinessDataLoaded } = useAppState();
  const signedOutRef = useRef(false);

  // If user lands on /auth while logged-in but NOT onboarded (stale/orphan session
  // with no business row), sign them out so they can actually log in to another
  // account instead of being trapped in the onboarding redirect loop.
  useEffect(() => {
    if (
      !isAuthLoading &&
      isLoggedIn &&
      isBusinessDataLoaded &&
      !isOnboarded &&
      !signedOutRef.current
    ) {
      signedOutRef.current = true;
      supabase.auth.signOut();
    }
  }, [isAuthLoading, isLoggedIn, isBusinessDataLoaded, isOnboarded]);

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

  // If logged in but not onboarded, the effect above signs them out;
  // show a loader during the brief sign-out, then the auth page will render.
  if (isLoggedIn && !isOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;