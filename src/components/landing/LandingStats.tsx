const stats = [
  { value: "9+", label: "Tahun Pengalaman" },
  { value: "11.000+", label: "Brand Terdaftar" },
  { value: "33+", label: "Provinsi di Indonesia" },
  { value: "99.9%", label: "Uptime Server" },
];

const LandingStats = () => {
  return (
    <section className="border-y border-border bg-card">
      <div className="container max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary md:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
