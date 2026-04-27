import danaLogo from "@/assets/integrations/dana.svg";
import dokuLogo from "@/assets/integrations/doku.svg";
import googleLogo from "@/assets/integrations/google.svg";
import gopayLogo from "@/assets/integrations/gopay.svg";
import midtransLogo from "@/assets/integrations/midtrans.svg";
import ovoLogo from "@/assets/integrations/ovo.svg";
import polarLogo from "@/assets/integrations/polar.svg";
import qrisLogo from "@/assets/integrations/qris.svg";
import shopeepayLogo from "@/assets/integrations/shopeepay.svg";
import tokopediaLogo from "@/assets/integrations/tokopedia.svg";

type Integration = { name: string; logo?: string };

const integrations: Integration[] = [
  { name: "WhatsApp" },
  { name: "Midtrans", logo: midtransLogo },
  { name: "Xendit" },
  { name: "Doku", logo: dokuLogo },
  { name: "Polar", logo: polarLogo },
  { name: "Google", logo: googleLogo },
  { name: "QRIS", logo: qrisLogo },
  { name: "GoPay", logo: gopayLogo },
  { name: "OVO", logo: ovoLogo },
  { name: "DANA", logo: danaLogo },
  { name: "ShopeePay", logo: shopeepayLogo },
  { name: "Tokopedia", logo: tokopediaLogo },
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
          {integrations.map((item) => (
            <div
              key={item.name}
              className="flex h-20 items-center justify-center rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={`${item.name} logo`}
                  loading="lazy"
                  className="max-h-8 w-auto max-w-[80%] object-contain"
                />
              ) : (
                item.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingIntegrations;