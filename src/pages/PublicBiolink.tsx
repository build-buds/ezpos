import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Instagram, MessageCircle, Globe, Music2, Mail, Phone, MapPin, Link2, Utensils, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BiolinkRow {
  id: string;
  business_id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  accent_color: string;
  links: any;
}

interface BizInfo {
  name: string;
  slug: string | null;
  menu_enabled: boolean;
}

const ICONS: Record<string, any> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  globe: Globe,
  music: Music2,
  mail: Mail,
  phone: Phone,
  map: MapPin,
  menu: Utensils,
  link: Link2,
};

const themeStyles: Record<string, { wrap: string; card: string; text: string; sub: string }> = {
  classic: {
    wrap: "bg-white text-gray-900",
    card: "bg-white border border-gray-200 hover:bg-gray-50",
    text: "text-gray-900",
    sub: "text-gray-500",
  },
  warm: {
    wrap: "bg-[#FBF6EE] text-[#3F2A14]",
    card: "bg-white/80 border border-[#E8DCC4] hover:bg-white",
    text: "text-[#3F2A14]",
    sub: "text-[#8B6F47]",
  },
  modern: {
    wrap: "bg-[#0F0F10] text-white",
    card: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
    text: "text-white",
    sub: "text-white/60",
  },
  minimal: {
    wrap: "bg-white text-gray-900",
    card: "bg-transparent border-b border-gray-300 rounded-none hover:bg-gray-50",
    text: "text-gray-900",
    sub: "text-gray-500",
  },
};

const PublicBiolink = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BiolinkRow | null>(null);
  const [biz, setBiz] = useState<BizInfo | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: bio } = await supabase
        .from("biolinks")
        .select("id, business_id, slug, display_name, bio, avatar_url, theme, accent_color, links")
        .eq("slug", slug)
        .eq("enabled", true)
        .maybeSingle();

      if (!active) return;
      if (!bio) {
        setLoading(false);
        return;
      }
      setData(bio as BiolinkRow);

      const { data: b } = await supabase
        .from("businesses")
        .select("name, slug, menu_enabled")
        .eq("id", bio.business_id)
        .maybeSingle();
      if (!active) return;
      setBiz(b as BizInfo | null);

      // increment view count (fire and forget)
      supabase.rpc("increment_biolink_view", { _slug: slug }).then(() => {});
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const title = data?.display_name || biz?.name || "Biolink";
    document.title = `${title} • EZPOS`;
  }, [data, biz]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Biolink tidak ditemukan</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Halaman ini tidak ada atau belum diaktifkan oleh pemiliknya.
          </p>
          <Link to="/" className="inline-block mt-4 text-sm text-primary underline">
            Kembali ke EZPOS
          </Link>
        </div>
      </div>
    );
  }

  const theme = themeStyles[data.theme] || themeStyles.classic;
  const accent = data.accent_color || "#2563EB";
  const links: Array<{ id: string; label: string; url: string; icon?: string; enabled?: boolean }> =
    Array.isArray(data.links) ? data.links : [];
  const visibleLinks = links.filter((l) => l && l.enabled !== false && l.url && l.label);

  // Auto add menu link
  const allLinks = [...visibleLinks];
  if (biz?.menu_enabled && biz?.slug) {
    allLinks.unshift({
      id: "auto-menu",
      label: "Lihat Menu Digital",
      url: `${window.location.origin}/menu/${biz.slug}`,
      icon: "menu",
      enabled: true,
    });
  }

  const displayName = data.display_name || biz?.name || "Biolink";

  return (
    <div className={cn("min-h-screen flex flex-col", theme.wrap)}>
      <div className="flex-1 max-w-md w-full mx-auto px-5 pt-12 pb-8 flex flex-col items-center">
        {/* Avatar */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md bg-muted flex items-center justify-center"
          style={{ borderColor: accent }}
        >
          {data.avatar_url ? (
            <img src={data.avatar_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: accent }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & Bio */}
        <h1 className={cn("mt-4 text-xl font-bold text-center", theme.text)}>{displayName}</h1>
        {data.bio && (
          <p className={cn("mt-2 text-sm text-center max-w-sm whitespace-pre-line", theme.sub)}>
            {data.bio}
          </p>
        )}

        {/* Links */}
        <div className="w-full mt-8 space-y-3">
          {allLinks.length === 0 ? (
            <p className={cn("text-center text-sm", theme.sub)}>Belum ada tautan.</p>
          ) : (
            allLinks.map((link) => {
              const Icon = ICONS[link.icon || "link"] || Link2;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]",
                    theme.card
                  )}
                  style={{
                    boxShadow: data.theme === "modern" ? undefined : `0 1px 0 ${accent}20`,
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accent}20`, color: accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className={cn("flex-1 text-sm font-semibold text-left", theme.text)}>
                    {link.label}
                  </span>
                  <ExternalLink className={cn("w-4 h-4", theme.sub)} />
                </a>
              );
            })
          )}
        </div>
      </div>

      <footer className="text-center py-5 text-xs opacity-60">
        <Link to="/" className={cn("hover:underline", theme.sub)}>
          Powered by <span className="font-bold">EZPOS</span>
        </Link>
      </footer>
    </div>
  );
};

export default PublicBiolink;
