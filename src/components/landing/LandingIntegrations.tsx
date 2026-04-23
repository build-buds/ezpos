const integrations = [
  "WhatsApp",
  "Midtrans",
  "Xendit",
  "Doku",
  "Polar",
  "Google",
  "QRIS",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "Tokopedia",
];

const LandingIntegrations = () => {
  return (
    <section
      id="integrasi"
      aria-labelledby="integrasi-title"
      className="bg-background py-20 md:py-28"
    >
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Integrasi</p>
          <h2
            id="integrasi-title"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Terhubung dengan <span className="text-primary">Layanan Favorit</span> Anda
          </h2>
          <p className="mt-4 text-muted-foreground">
            EZPOS terintegrasi dengan platform pembayaran, marketplace, dan layanan pendukung
            terpopuler di Indonesia.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {integrations.map((name) => (
            <div
              key={name}
              className="flex h-20 items-center justify-center rounded-2xl border border-border bg-card text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingIntegrations;