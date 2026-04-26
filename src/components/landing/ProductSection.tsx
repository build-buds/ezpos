import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  id?: string;
  imageScale?: number;
}

const ProductSection = ({
  eyebrow,
  title,
  description,
  features,
  image,
  imageAlt,
  reverse = false,
  primaryCta,
  secondaryCta,
  id,
  imageScale = 1,
}: ProductSectionProps) => {
  const navigate = useNavigate();

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 md:py-24">
      <div className="container max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className={`order-1 ${reverse ? "md:order-2" : "md:order-1"}`}>
            <div className="relative">
              <div className="aspect-[4/3] w-full overflow-visible">
                <img
                  src={image}
                  alt={imageAlt}
                  loading="lazy"
                  style={{ transform: `scale(${imageScale})` }}
                  className="h-full w-full object-contain origin-center"
                />
              </div>
            </div>
          </div>

          <div className={`order-2 ${reverse ? "md:order-1" : "md:order-2"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
            <h2
              id={`${id}-title`}
              className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">{description}</p>

            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            {(primaryCta || secondaryCta) && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {primaryCta && (
                  <Button variant="cta" size="lg" onClick={() => navigate(primaryCta.to)}>
                    {primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button variant="outline" size="lg" onClick={() => navigate(secondaryCta.to)}>
                    {secondaryCta.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;