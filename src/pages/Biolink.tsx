import { useEffect, useMemo, useRef, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Copy,
  ExternalLink,
  Upload,
  Shuffle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Instagram,
  MessageCircle,
  Globe,
  Music2,
  Mail,
  Phone,
  MapPin,
  Link2,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { generateSlug, isValidSlug, sanitizeSlugInput } from "@/lib/slug";
import { cn } from "@/lib/utils";

interface BioLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
}

const ICON_OPTIONS = [
  { value: "link", label: "Link", Icon: Link2 },
  { value: "instagram", label: "Instagram", Icon: Instagram },
  { value: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { value: "globe", label: "Website", Icon: Globe },
  { value: "music", label: "TikTok/Music", Icon: Music2 },
  { value: "mail", label: "Email", Icon: Mail },
  { value: "phone", label: "Telepon", Icon: Phone },
  { value: "map", label: "Lokasi/Maps", Icon: MapPin },
];

const themes = [
  { value: "classic", label: "Classic", preview: "bg-white border border-gray-300" },
  { value: "warm", label: "Warm", preview: "bg-[#FBF6EE] border border-[#E8DCC4]" },
  { value: "modern", label: "Modern", preview: "bg-[#0F0F10] border border-[#2A2A2E]" },
  { value: "minimal", label: "Minimal", preview: "bg-white border-b-2 border-gray-400" },
];

const newId = () => Math.random().toString(36).slice(2, 10);

const Biolink = () => {
  const { businessId, businessName } = useAppState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#2563EB");
  const [links, setLinks] = useState<BioLink[]>([]);
  const [viewCount, setViewCount] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [qrPreview, setQrPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slugValid = isValidSlug(slug);
  const bioUrl = slug ? `${window.location.origin}/bio/${slug}` : "";

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    supabase
      .from("biolinks")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExists(true);
          setEnabled(data.enabled);
          setSlug(data.slug);
          setOriginalSlug(data.slug);
          setDisplayName(data.display_name || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url);
          setTheme(data.theme);
          setAccentColor(data.accent_color);
          setLinks(Array.isArray(data.links) ? (data.links as unknown as BioLink[]) : []);
          setViewCount(data.view_count || 0);
        } else {
          // Defaults for new biolink
          setSlug(generateSlug(businessName || "bio"));
          setDisplayName(businessName || "");
        }
        setLoading(false);
      });
  }, [businessId, businessName]);

  useEffect(() => {
    if (!bioUrl || !slugValid) {
      setQrPreview("");
      return;
    }
    QRCode.toDataURL(bioUrl, { width: 300, margin: 1 }).then(setQrPreview).catch(() => {});
  }, [bioUrl, slugValid]);

  const addLink = (preset?: Partial<BioLink>) => {
    setLinks((prev) => [
      ...prev,
      {
        id: newId(),
        label: preset?.label || "",
        url: preset?.url || "",
        icon: preset?.icon || "link",
        enabled: true,
      },
    ]);
  };

  const updateLink = (id: string, patch: Partial<BioLink>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const moveLink = (id: string, dir: -1 | 1) => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran maksimal 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${businessId}/biolink-avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload gagal: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success("Avatar berhasil diunggah!");
  };

  const handleSave = async () => {
    if (!businessId) return;
    if (!slugValid) {
      toast.error("Slug 3-40 karakter, huruf kecil/angka/tanda hubung saja.");
      return;
    }
    setSaving(true);

    // unique slug check (exclude self)
    if (slug !== originalSlug) {
      const { data: dup } = await supabase
        .from("biolinks")
        .select("id")
        .eq("slug", slug)
        .neq("business_id", businessId)
        .maybeSingle();
      if (dup) {
        setSaving(false);
        toast.error("Slug sudah dipakai. Coba yang lain.");
        return;
      }
    }

    // sanitize links
    const cleanLinks = links
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l) => ({ ...l, label: l.label.trim(), url: l.url.trim() }));

    const payload = {
      business_id: businessId,
      slug,
      enabled,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
      theme,
      accent_color: accentColor,
      links: cleanLinks as any,
    };

    const { error } = exists
      ? await supabase.from("biolinks").update(payload).eq("business_id", businessId)
      : await supabase.from("biolinks").insert(payload);

    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
      return;
    }
    setExists(true);
    setOriginalSlug(slug);
    setLinks(cleanLinks);
    toast.success("Biolink tersimpan!");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(bioUrl);
    toast.success("Tautan disalin!");
  };

  const downloadQr = () => {
    if (!qrPreview) return;
    const a = document.createElement("a");
    a.href = qrPreview;
    a.download = `biolink-${slug}.png`;
    a.click();
  };

  const quickAdds = useMemo(
    () => [
      { label: "WhatsApp", icon: "whatsapp", url: "https://wa.me/628" },
      { label: "Instagram", icon: "instagram", url: "https://instagram.com/" },
      { label: "Google Maps", icon: "map", url: "https://maps.google.com/?q=" },
      { label: "Email", icon: "mail", url: "mailto:" },
    ],
    []
  );

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-6 text-primary-foreground bg-primary">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-bold">Biolink Bisnis</h1>
        </div>
        <p className="mt-1 text-xs opacity-80">
          Satu link untuk semua channel bisnismu — cocok untuk bio Instagram & WhatsApp.
        </p>
        {exists && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs">
            <Eye className="w-3 h-3" /> {viewCount} kunjungan
          </div>
        )}
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-5 space-y-6 lg:max-w-3xl lg:mx-auto pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-card rounded-2xl card-shadow">
              <div>
                <p className="text-sm font-semibold">Aktifkan Biolink</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Halaman publik dapat diakses orang lain
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tautan Biolink</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center h-11 rounded-xl border border-input bg-background overflow-hidden">
                  <span className="px-3 text-xs text-muted-foreground border-r border-input bg-muted/50 h-full flex items-center whitespace-nowrap">
                    /bio/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))}
                    placeholder="warung-budi"
                    className="border-0 h-full rounded-none focus-visible:ring-0 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => setSlug(generateSlug(businessName || "bio"))}
                  title="Acak ulang"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
              <p className={cn("text-xs", slugValid ? "text-muted-foreground" : "text-destructive")}>
                {slugValid
                  ? "3-40 karakter. Huruf kecil, angka, dan tanda hubung."
                  : "Slug tidak valid."}
              </p>
            </div>

            {/* URL + QR */}
            {slugValid && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input value={bioUrl} readOnly className="h-11 rounded-xl text-xs" />
                  <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={copyUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => window.open(bioUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                {qrPreview && (
                  <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <img src={qrPreview} alt="QR Biolink" className="w-32 h-32 rounded-lg bg-white p-2" />
                    <Button variant="outline" className="h-9 text-xs" onClick={downloadQr}>
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Avatar */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Foto Profil / Logo</Label>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  className="h-11 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Mengunggah..." : avatarUrl ? "Ganti Foto" : "Unggah Foto"}
                </Button>
                {avatarUrl && (
                  <Button variant="ghost" size="sm" onClick={() => setAvatarUrl(null)}>
                    Hapus
                  </Button>
                )}
              </div>
            </div>

            {/* Display name & bio */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Nama Tampilan</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={businessName || "Nama bisnis"}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Bio Singkat</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Misal: Coffee shop di Bandung. Open 8am - 10pm setiap hari."
                className="rounded-xl resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-[10px] text-muted-foreground text-right">{bio.length}/200</p>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Tautan</Label>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => addLink()}>
                  <Plus className="w-3 h-3 mr-1" /> Tambah
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {quickAdds.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => addLink(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground"
                    type="button"
                  >
                    + {q.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                {links.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6 bg-muted/30 rounded-xl">
                    Belum ada tautan. Tambahkan di atas.
                  </p>
                )}
                {links.map((link, idx) => {
                  const IconCmp =
                    ICON_OPTIONS.find((o) => o.value === link.icon)?.Icon || Link2;
                  return (
                    <div key={link.id} className="p-3 bg-card rounded-xl card-shadow space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={link.icon}
                          onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                          className="h-9 text-xs px-2 rounded-lg border border-input bg-background"
                        >
                          {ICON_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <IconCmp className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1" />
                        <Switch
                          checked={link.enabled}
                          onCheckedChange={(c) => updateLink(link.id, { enabled: c })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveLink(link.id, -1)}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveLink(link.id, 1)}
                          disabled={idx === links.length - 1}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeLink(link.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={link.label}
                        onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        placeholder="Label (mis. Pesan via WhatsApp)"
                        className="h-9 rounded-lg text-xs"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="h-9 rounded-lg text-xs font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tema</Label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-xs font-medium transition-all",
                      theme === t.value ? "border-primary" : "border-transparent bg-muted"
                    )}
                  >
                    <div className={cn("w-full h-12 rounded-md mb-2", t.preview)} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Warna Aksen</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-14 h-11 rounded-xl border border-input cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-11 rounded-xl flex-1 font-mono text-xs uppercase"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky save */}
      {!loading && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 px-5 md:px-8 py-3 bg-background/95 backdrop-blur border-t border-border z-30">
          <div className="lg:max-w-3xl lg:mx-auto">
            <Button
              variant="cta"
              className="w-full h-12 text-sm"
              onClick={handleSave}
              disabled={saving || !slugValid}
            >
              {saving ? "Menyimpan..." : "Simpan Biolink"}
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Biolink;
