import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/contexts/AppContext";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";

const navItems = [
  { label: "Produk & Fitur", href: "#produk" },
  { label: "Tentang Kami", href: "#why-choose" },
  { label: "Integrasi", href: "#integrasi" },
  { label: "Harga", href: "#pricing" },
  { label: "Resources", href: "#faq" },
];

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isOnboarded } = useAppState();
  const [open, setOpen] = useState(false);

  const ctaTarget = isLoggedIn ? (isOnboarded ? "/dashboard" : "/onboarding") : "/auth";

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center" aria-label="EZPOS">
          <img src={logoWhite} alt="EZPOS" className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}
          >
            Masuk
          </Button>
          <Button
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => navigate(ctaTarget)}
          >
            Daftar
          </Button>
          <Button variant="cta" onClick={() => navigate("/contact")}>
            Hubungi Kami
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buka menu"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="text-left">
                <img src={logoBlack} alt="EZPOS" className="h-6 w-auto" />
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="rounded-md px-3 py-3 text-left text-base font-medium hover:bg-muted"
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); navigate(isLoggedIn ? "/dashboard" : "/auth"); }}>
                  Masuk
                </Button>
                <Button variant="outline" onClick={() => { setOpen(false); navigate(ctaTarget); }}>
                  Daftar
                </Button>
                <Button
                  variant="cta"
                  onClick={() => {
                    setOpen(false);
                    navigate("/contact");
                  }}
                >
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default LandingNavbar;
