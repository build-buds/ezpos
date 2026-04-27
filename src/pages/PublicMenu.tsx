import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Store, UtensilsCrossed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEO from "@/components/SEO";

interface BusinessData {
  id: string;
  name: string;
  address: string | null;
  menu_title: string | null;
  menu_description: string | null;
  menu_theme: string;
  menu_accent_color: string;
  menu_logo_url: string | null;
}

interface MenuProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
}

type ThemeStyle = {
  bg: string;
  bgPattern?: string;
  card: string;
  text: string;
  muted: string;
  flat?: boolean;
};

// Subtle SVG patterns as data URIs — kept low-opacity so accent color stays focal
const patterns = {
  // Light dots for classic
  dots: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='2' cy='2' r='1' fill='%23000000' opacity='0.06'/></svg>")`,
  // Diagonal cross-hatch for warm (tradisional/rustic feel)
  hatch: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><path d='M0 20L20 0' stroke='%238B6F47' stroke-width='0.5' opacity='0.15'/><path d='M-5 5L5 -5M15 25L25 15' stroke='%238B6F47' stroke-width='0.5' opacity='0.15'/></svg>")`,
  // Grid for modern (tech/elegant)
  grid: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><path d='M32 0H0V32' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.06'/></svg>")`,
  // Thin horizontal lines for minimal (paper/notebook feel)
  lines: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><path d='M0 4H8' stroke='%23000000' stroke-width='0.3' opacity='0.05'/></svg>")`,
};

const themeStyles: Record<string, ThemeStyle> = {
  classic: {
    bg: "bg-white",
    bgPattern: patterns.dots,
    card: "bg-white border border-gray-200",
    text: "text-gray-900",
    muted: "text-gray-500",
  },
  warm: {
    bg: "bg-[#FBF6EE]",
    bgPattern: patterns.hatch,
    card: "bg-white border border-[#E8DCC4]",
    text: "text-[#3B2A1A]",
    muted: "text-[#8B6F47]",
  },
  modern: {
    bg: "bg-[#0F0F10]",
    bgPattern: patterns.grid,
    card: "bg-[#1A1A1C] border border-[#2A2A2E]",
    text: "text-white",
    muted: "text-gray-400",
  },
  minimal: {
    bg: "bg-white",
    bgPattern: patterns.lines,
    card: "border-b border-gray-200",
    text: "text-gray-900",
    muted: "text-gray-500",
    flat: true,
  },
};

const PublicMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id, name, address, menu_title, menu_description, menu_theme, menu_accent_color, menu_logo_url")
        .eq("slug", slug)
        .eq("menu_enabled", true)
        .maybeSingle();

      if (!biz) {
        setLoading(false);
        return;
      }
      setBusiness(biz as BusinessData);

      const { data: prods } = await supabase
        .from("products")
        .select("id, name, description, price, category, image_url")
        .eq("business_id", biz.id)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      setProducts((prods as MenuProduct[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category || "Lainnya"));
    return Array.from(set);
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground mb-3" />
        <h1 className="text-lg font-bold">Menu tidak tersedia</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Menu digital ini belum diaktifkan atau tautan tidak valid.
        </p>
      </div>
    );
  }

  const theme = themeStyles[business.menu_theme] || themeStyles.classic;
  const accent = business.menu_accent_color || "#2563EB";
  const isDark = business.menu_theme === "modern";

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => (p.category || "Lainnya") === activeCategory);

  const grouped = filteredProducts.reduce<Record<string, MenuProduct[]>>((acc, p) => {
    const key = p.category || "Lainnya";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text}`}
      style={theme.bgPattern ? { backgroundImage: theme.bgPattern } : undefined}
    >
      <SEO
        title={`${business.menu_title || business.name} — Menu Digital`}
        description={
          business.menu_description ||
          `Lihat menu digital ${business.name} dan pesan langsung dari ponsel Anda. Didukung oleh EZPOS.`
        }
        path={`/menu/${slug ?? ""}`}
        image={business.menu_logo_url || undefined}
      />
      {/* Header */}
      <header
        className="px-6 pt-10 pb-8 text-white"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}
      >
        <div className="max-w-2xl mx-auto text-center">
          {business.menu_logo_url ? (
            <img
              src={business.menu_logo_url}
              alt={business.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Store className="w-9 h-9" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {business.menu_title && (
            <p className="text-base opacity-90 mt-1">{business.menu_title}</p>
          )}
          {business.menu_description && (
            <p className="text-sm opacity-80 mt-2 max-w-md mx-auto">{business.menu_description}</p>
          )}
          {business.address && (
            <p className="text-xs opacity-70 mt-3">{business.address}</p>
          )}
        </div>
      </header>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div
          className={`sticky top-0 z-10 ${theme.bg} px-4 py-3 border-b ${
            isDark ? "border-[#2A2A2E]" : "border-gray-200/70"
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger
                className={`h-11 rounded-xl text-sm font-medium ${
                  isDark
                    ? "bg-[#1A1A1C] border-[#2A2A2E] text-white"
                    : "bg-white"
                }`}
                style={{ borderColor: activeCategory !== "all" ? accent : undefined }}
              >
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className={isDark ? "bg-[#1A1A1C] border-[#2A2A2E] text-white" : ""}>
                <SelectItem value="all">Semua Kategori ({products.length})</SelectItem>
                {categories.map((cat) => {
                  const count = products.filter((p) => (p.category || "Lainnya") === cat).length;
                  return (
                      <SelectItem key={cat} value={cat}>
                      {cat} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Menu */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {Object.keys(grouped).length === 0 ? (
          <p className={`text-center py-12 ${theme.muted}`}>Belum ada menu yang tersedia.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-3 pl-1"
                style={{ color: accent }}
              >
                {category}
              </h2>
              <div className={theme.flat ? "" : "space-y-3"}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`${theme.card} ${
                      theme.flat
                        ? `py-4 flex gap-3 items-start ${idx === items.length - 1 ? "border-b-0" : ""}`
                        : "rounded-2xl p-3 flex gap-3 items-start"
                    }`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className={`${
                          theme.flat ? "w-16 h-16" : "w-20 h-20"
                        } rounded-xl object-cover flex-shrink-0`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-snug">{item.name}</h3>
                        <span className="text-sm font-bold whitespace-nowrap" style={{ color: accent }}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {item.description && (
                        <p className={`text-xs mt-1 line-clamp-2 ${theme.muted}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className={`text-center py-6 text-xs ${theme.muted}`}>
        Powered by EZPOS
      </footer>
    </div>
  );
};

export default PublicMenu;
