import { useEffect, useState } from "react";
import { useAppState } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Download, ExternalLink, Upload, Shuffle, Info } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import SettingsSheet from "./SettingsSheet";
import { generateSlug, isValidSlug, sanitizeSlugInput } from "@/lib/slug";
import { generateMenuPdf } from "@/lib/menuPdf";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

const themes = [
  { value: "classic", label: "Classic", preview: "bg-white border border-gray-300" },
  { value: "warm", label: "Warm", preview: "bg-[#FBF6EE] border border-[#E8DCC4]" },
  { value: "modern", label: "Modern", preview: "bg-[#0F0F10] border border-[#2A2A2E]" },
  { value: "minimal", label: "Minimal", preview: "bg-white border-b-2 border-gray-400" },
];

const SettingsDigitalMenu = ({ open, onClose }: Props) => {
  const { businessId, businessName } = useAppState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("classic");
  const [accentColor, setAccentColor] = useState("#2563EB");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const menuUrl = slug ? `${window.location.origin}/menu/${slug}` : "";
  const slugValid = isValidSlug(slug);

  useEffect(() => {
    if (!open || !businessId) return;
    setLoading(true);
    supabase
      .from("businesses")
      .select("slug, menu_enabled, menu_title, menu_description, menu_theme, menu_accent_color, menu_logo_url, name")
      .eq("id", businessId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          let currentSlug = data.slug;
          if (!currentSlug) {
            currentSlug = generateSlug(data.name);
            await supabase.from("businesses").update({ slug: currentSlug }).eq("id", businessId);
          }
          setSlug(currentSlug);
          setOriginalSlug(currentSlug);
          setEnabled(data.menu_enabled);
          setTitle(data.menu_title || "");
          setDescription(data.menu_description || "");
          setTheme(data.menu_theme || "classic");
          setAccentColor(data.menu_accent_color || "#2563EB");
          setLogoUrl(data.menu_logo_url);
        }
        setLoading(false);
      });
  }, [open, businessId]);

  useEffect(() => {
    if (!menuUrl || !slugValid) return;
    QRCode.toDataURL(menuUrl, { width: 300, margin: 1 }).then(setQrPreview);
  }, [menuUrl, slugValid]);

  const handleSave = async () => {
    if (!businessId) return;
    if (!slugValid) {
      toast.error("Slug harus 3-40 karakter, huruf kecil/angka/tanda hubung saja.");
      return;
    }
    setSaving(true);

    // Cek slug unik jika berubah
    if (slug !== originalSlug) {
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .neq("id", businessId)
        .maybeSingle();
      if (existing) {
        setSaving(false);
        toast.error("Slug sudah dipakai bisnis lain. Coba yang lain.");
        return;
      }
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        slug,
        menu_enabled: enabled,
        menu_title: title || null,
        menu_description: description || null,
        menu_theme: theme,
        menu_accent_color: accentColor,
        menu_logo_url: logoUrl,
      })
      .eq("id", businessId);
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
      return;
    }
    setOriginalSlug(slug);
    toast.success("Menu digital diperbarui!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success("Tautan disalin!");
  };

  const handleRandomizeSlug = () => {
    setSlug(generateSlug(businessName || "menu"));
  };

  const handleDownloadPdf = async () => {
    if (!menuUrl) return;
    setGeneratingPdf(true);
    try {
      await generateMenuPdf({
        businessName,
        title,
        description,
        logoUrl: logoUrl || undefined,
        accentColor,
        menuUrl,
      });
      toast.success("PDF berhasil diunduh!");
    } catch (err: any) {
      toast.error("Gagal membuat PDF: " + (err?.message || "unknown"));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran maksimal 2MB");
      return;
    }

    // Validasi rasio 1:1
    const isSquare = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === img.height);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });

    if (!isSquare) {
      toast.error("Logo harus rasio 1:1 (persegi). Crop dulu sebelum upload.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${businessId}/menu-logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload gagal: " + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
    toast.success("Logo berhasil diunggah!");
  };

  return (
    <SettingsSheet
      open={open}
      onClose={onClose}
      title="Menu Digital & QR Code"
      footer={
        <Button variant="cta" className="w-full h-12 text-sm" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="text-sm font-semibold">Aktifkan Menu Digital</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pelanggan bisa scan QR untuk lihat menu
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Custom Slug */}
          {enabled && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tautan Kustom (Slug)</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center h-11 rounded-xl border border-input bg-background overflow-hidden">
                  <span className="px-3 text-xs text-muted-foreground border-r border-input bg-muted/50 h-full flex items-center whitespace-nowrap">
                    /menu/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))}
                    placeholder="warung-saya"
                    className="border-0 h-full rounded-none focus-visible:ring-0 text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={handleRandomizeSlug}
                  title="Acak ulang"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
              <p className={cn("text-xs", slugValid ? "text-muted-foreground" : "text-destructive")}>
                {slugValid
                  ? "3-40 karakter. Hanya huruf kecil, angka, dan tanda hubung."
                  : "Slug tidak valid. Min 3 karakter, huruf kecil/angka/dash saja."}
              </p>
            </div>
          )}

          {/* URL + QR */}
          {enabled && slugValid && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold">Tautan Menu</Label>
              <div className="flex gap-2">
                <Input value={menuUrl} readOnly className="h-11 rounded-xl text-xs" />
                <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => window.open(menuUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {qrPreview && (
                <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-xl">
                  <img src={qrPreview} alt="QR Preview" className="w-40 h-40 rounded-lg bg-white p-2" />
                  <Button
                    variant="outline"
                    className="h-10 text-xs"
                    onClick={handleDownloadPdf}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Download PDF Cetak
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Customization */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Judul Menu</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Menu Spesial Kami"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Deskripsi</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sambutan singkat untuk pelanggan..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Logo Menu</Label>
            <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-xl">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gunakan gambar <span className="font-semibold text-foreground">persegi (rasio 1:1)</span>,
                minimal 200×200px, maksimal 2MB. Format PNG/JPG.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-14 h-14 rounded-xl object-cover border" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                <div className="h-11 px-4 rounded-xl border border-input bg-background flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-muted">
                  {uploading ? "Mengunggah..." : logoUrl ? "Ganti Logo" : "Unggah Logo"}
                </div>
              </label>
              {logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>
                  Hapus
                </Button>
              )}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Tema Menu</Label>
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

          {/* Accent Color */}
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
        </div>
      )}
    </SettingsSheet>
  );
};

export default SettingsDigitalMenu;
