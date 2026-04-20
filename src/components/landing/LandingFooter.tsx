import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center">
              <span className="font-display text-xl font-bold text-foreground">EZPOS</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Platform kasir & manajemen bisnis untuk pelaku usaha Indonesia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Produk</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary">Fitur</a></li>
              <li><a href="#pricing" className="hover:text-primary">Harga</a></li>
              <li><a href="#business" className="hover:text-primary">Untuk Bisnis</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Perusahaan</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
              <li><a href="mailto:halo@ezpos.id" className="hover:text-primary">Kontak</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EZPOS. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
