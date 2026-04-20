import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/contexts/AppContext";

const LandingCTA = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isOnboarded } = useAppState();
  const target = isLoggedIn ? (isOnboarded ? "/dashboard" : "/onboarding") : "/auth";

  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="container max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center md:px-16 md:py-24">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              <span className="text-accent">#SelaluAda</span> untuk membantu bisnis Anda tumbuh
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-primary-foreground/80 md:text-lg">
              Bergabung dengan ribuan pelaku usaha Indonesia yang sudah merasakan kemudahan EZPOS.
            </p>
            <Button variant="cta" size="lg" className="mt-8" onClick={() => navigate(target)}>
              Coba Gratis Sekarang
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
