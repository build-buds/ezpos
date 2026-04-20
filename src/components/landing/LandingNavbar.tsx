import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/contexts/AppContext";

const navItems = [
  { label: "Fitur", href: "#features" },
  { label: "Bisnis", href: "#business" },
  { label: "Harga", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="EZPOS" className="h-8 w-auto" />
          <span className="font-display text-xl font-bold text-foreground">EZPOS</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" onClick={() => navigate(isLoggedIn ? "/dashboard" : "/auth")}>
            Masuk
          </Button>
          <Button variant="cta" onClick={() => navigate(ctaTarget)}>
            Coba Gratis
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="font-display text-left">EZPOS</SheetTitle>
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
                <Button variant="cta" onClick={() => { setOpen(false); navigate(ctaTarget); }}>
                  Coba Gratis
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
