import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <SEO
        title="Halaman Tidak Ditemukan — EZPOS"
        description="Halaman yang Anda cari tidak tersedia. Kembali ke beranda EZPOS untuk menjelajahi solusi kasir POS dan manajemen F&B."
        path={location.pathname}
        noIndex
      />
      <div className="text-center">
        <p className="mb-2 text-5xl font-bold text-muted-foreground" aria-hidden="true">404</p>
        <h1 className="mb-3 text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mb-4 text-base text-muted-foreground">Maaf, halaman yang Anda cari tidak tersedia.</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Kembali ke beranda
        </a>
      </div>
    </main>
  );
};

export default NotFound;
