const steps = [
  { n: "01", title: "Daftar Gratis", desc: "Buat akun dalam 30 detik dengan email atau Google." },
  { n: "02", title: "Setup Bisnis", desc: "Pilih jenis usaha, isi profil, dan tambah produk pertama Anda." },
  { n: "03", title: "Mulai Jualan", desc: "Buka kasir, terima pesanan, dan lihat laporan masuk real-time." },
];

const LandingHowItWorks = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            Mulai dalam <em className="text-primary">3 langkah mudah</em>
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-display text-7xl font-bold text-primary/15">{s.n}</div>
              <h3 className="mt-2 font-display text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
