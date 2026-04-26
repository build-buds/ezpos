import { useEffect } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import LandingBusiness from "@/components/landing/LandingBusiness";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Landing = () => {
  useEffect(() => {
    document.title = "EZPOS — Kasir & Manajemen Bisnis #1 di Indonesia";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "EZPOS: aplikasi kasir POS, manajemen produk, dan laporan real-time untuk restoran, warung, dan toko di Indonesia. Gratis selamanya.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingBusiness />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
