const LandingProductIntro = () => {
  return (
    <section
      id="produk"
      aria-labelledby="produk-intro-title"
      className="bg-background pt-20 md:pt-28"
    >
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Produk Kami
          </p>
          <h2
            id="produk-intro-title"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Sederhanakan & Optimalkan Operasional{" "}
            <span className="text-primary">Bisnis F&B Anda</span> dengan Solusi Inovatif Kami
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Dari kasir, pemesanan QR, kiosk self-service, hingga manajemen antrian — semua
            terintegrasi dalam satu platform EZPOS.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingProductIntro;