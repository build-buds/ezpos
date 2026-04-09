import { useNavigate } from "react-router-dom";
import { useAppState } from "@/contexts/AppContext";
import { BusinessCategory } from "@/types";
import { ShoppingCart, UtensilsCrossed, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const categories: { id: BusinessCategory; label: string; description: string; icon: typeof ShoppingCart; colorClass: string; bgClass: string }[] = [
  {
    id: "warung",
    label: "Warung / Kelontong",
    description: "Toko kelontong, warung sembako, minimarket kecil",
    icon: ShoppingCart,
    colorClass: "text-primary border-primary",
    bgClass: "bg-warung-light",
  },
  {
    id: "restoran",
    label: "Restoran / Warung Makan",
    description: "Warung makan, restoran kecil, kedai kopi, food stall",
    icon: UtensilsCrossed,
    colorClass: "text-restoran border-restoran",
    bgClass: "bg-restoran-light",
  },
  {
    id: "onlineshop",
    label: "Online Shop / Reseller",
    description: "Jualan online via WA, Instagram, Tokopedia, Shopee",
    icon: Package,
    colorClass: "text-onlineshop border-onlineshop",
    bgClass: "bg-onlineshop-light",
  },
];

const OnboardingCategory = () => {
  const navigate = useNavigate();
  const { setBusinessCategory } = useAppState();

  const handleSelect = (cat: BusinessCategory) => {
    setBusinessCategory(cat);
    navigate("/onboarding/setup");
  };

  return (
    <div className="min-h-screen max-w-lg md:max-w-2xl mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 md:px-10 pt-12 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Selamat Datang di</h1>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mt-1">EASYPOS</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Pilih jenis bisnis kamu untuk pengalaman yang sesuai. Kasir, stok, laporan — semua disesuaikan untuk bisnismu.
        </p>
      </div>

      {/* Category Cards */}
      <div className="flex-1 px-6 md:px-10 space-y-4 pb-12">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pilih Kategori Bisnis</p>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98] card-shadow bg-card",
                "border-transparent hover:border-current",
                cat.colorClass
              )}
            >
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", cat.bgClass)}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-foreground text-base">{cat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cat.description}</p>
              </div>
              <Icon className="w-5 h-5 opacity-40" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingCategory;
