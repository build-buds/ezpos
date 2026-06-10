import { useEffect } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import LandingProductIntro from "@/components/landing/LandingProductIntro";
import LandingMainProducts from "@/components/landing/LandingMainProducts";
import LandingSubProducts from "@/components/landing/LandingSubProducts";
import LandingOthers from "@/components/landing/LandingOthers";
import LandingWhyChoose from "@/components/landing/LandingWhyChoose";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingIntegrations from "@/components/landing/LandingIntegrations";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";

const Landing = () => {
  const revealRef = useRevealOnScroll<HTMLDivElement>();

  // Auto cache-busting: clear caches & unregister SW so the landing page
  // always reflects the latest deployed version on every visit.
  useEffect(() => {
    const bustCaches = async () => {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch {
        // best-effort — ignore failures
      }
    };
    bustCaches();
  }, []);

  return (
    <div ref={revealRef} className="min-h-screen bg-background">
      <SEO
        title="EZPOS — Kasir Restoran & Manajemen F&B #1 di Indonesia"
        description="EZPOS: Solusi lengkap kasir POS, QR ordering, kiosk self-service, dan manajemen antrian untuk restoran, kafe, dan warung makan di Indonesia."
        path="/"
      />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "EZPOS",
            url: "https://ezpos.id/",
            logo: "https://ezpos.id/icon-192.png",
            description:
              "Platform kasir POS, QR ordering, kiosk self-service, dan manajemen antrian untuk bisnis F&B di Indonesia.",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "halo@ezpos.id",
              areaServed: "ID",
              availableLanguage: ["Indonesian"],
            },
            sameAs: ["https://ezpos.lovable.app"],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "EZPOS",
            url: "https://ezpos.id/",
            inLanguage: "id-ID",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://ezpos.id/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "EZPOS",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, Android, iOS",
            inLanguage: "id-ID",
            url: "https://ezpos.id/",
            offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
            description:
              "Aplikasi kasir POS untuk restoran, kafe, dan warung makan di Indonesia. Gratis selamanya untuk paket dasar.",
          },
        ]}
      />
      <LandingNavbar />
      <main>
        <div data-reveal><LandingHero /></div>
        <div data-reveal><LandingStats /></div>
        <div data-reveal><LandingProductIntro /></div>
        <div data-reveal><LandingMainProducts /></div>
        <div data-reveal><LandingSubProducts /></div>
        <div data-reveal><LandingOthers /></div>
        <div data-reveal><LandingWhyChoose /></div>
        <div data-reveal><LandingHowItWorks /></div>
        <div data-reveal><LandingPricing /></div>
        <div data-reveal><LandingTestimonials /></div>
        <div data-reveal><LandingIntegrations /></div>
        <div data-reveal><LandingFAQ /></div>
        <div data-reveal><LandingCTA /></div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
