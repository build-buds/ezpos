import { Link } from "react-router-dom";
import logoBlack from "@/assets/logo-black.png";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center">
              <img src={logoBlack} alt="EZPOS" className="h-7 w-auto" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Platform kasir & manajemen bisnis untuk pelaku usaha Indonesia.
            </p>
          </div>

          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className="text-base font-semibold text-foreground">Produk</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary">Fitur</a></li>
              <li><a href="#pricing" className="hover:text-primary">Harga</a></li>
              <li><a href="#business" className="hover:text-primary">Untuk Bisnis</a></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className="text-base font-semibold text-foreground">Perusahaan</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
              <li><Link to="/contact" className="hover:text-primary">Hubungi Kami</Link></li>
              <li><a href="mailto:halo@ezpos.id" className="hover:text-primary">Email</a></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="text-base font-semibold text-foreground">Legal</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Kebijakan Privasi</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EZPOS. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
