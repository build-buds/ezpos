import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Settings as SettingsIcon, BarChart3, Copy, ExternalLink, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/contexts/AppContext";
import { useKioskSettings, useUpsertKioskSettings, useKioskSessions } from "@/hooks/useKiosk";
import { useTransactions } from "@/hooks/useTransactions";
import { formatRupiah } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Tunai" },
  { value: "qris", label: "QRIS" },
  { value: "transfer", label: "Transfer" },
];

const KioskPage = () => {
  const { businessId } = useAppState();
  const { data: settings } = useKioskSettings();
  const { data: sessions = [] } = useKioskSessions(7);
  const { data: transactions = [] } = useTransactions("month");
  const upsert = useUpsertKioskSettings();

  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const fetchSlug = async () => {
      if (!businessId) return;
      const { data } = await supabase.from("businesses").select("slug").eq("id", businessId).maybeSingle();
      if (data?.slug) setSlug(data.slug);
    };
    fetchSlug();
  }, [businessId]);

  const kioskUrl = slug ? `${window.location.origin}/kiosk/${slug}` : "";

  const kioskTx = transactions.filter((t) => t.order_type?.startsWith("kiosk"));
  const completed = sessions.filter((s) => s.completed_at).length;
  const conv = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0;
  const avg = kioskTx.length > 0 ? Math.round(kioskTx.reduce((s, t) => s + t.total, 0) / kioskTx.length) : 0;

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-bold">EZPOS Kiosk</h1>
        </div>
        <p className="text-xs opacity-80 mt-1">Self-service ordering untuk pelanggan</p>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-4 lg:max-w-5xl lg:mx-auto">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" />Ringkasan</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-1" />Pengaturan</TabsTrigger>
            <TabsTrigger value="orders"><ListOrdered className="w-4 h-4 mr-1" />Transaksi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Sesi 7 hari</p>
                <p className="text-2xl font-extrabold">{sessions.length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Konversi</p>
                <p className="text-2xl font-extrabold">{conv}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Rata-rata Order</p>
                <p className="text-lg font-extrabold">{formatRupiah(avg)}</p>
              </Card>
            </div>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Link Kiosk</p>
                <Badge variant={settings?.enabled ? "default" : "secondary"}>
                  {settings?.enabled ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              {!slug ? (
                <p className="text-xs text-muted-foreground">
                  Atur slug bisnis di Pengaturan → Bisnis untuk mendapatkan link kiosk.
                </p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input value={kioskUrl} readOnly className="text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(kioskUrl);
                        toast.success("Link disalin");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => window.open(kioskUrl, "_blank")}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Buka link ini di tablet atau layar sentuh untuk menjalankan mode kiosk.
                  </p>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <SettingsForm
              settings={settings}
              onSave={(patch) =>
                upsert.mutate(patch, {
                  onSuccess: () => toast.success("Pengaturan disimpan"),
                  onError: (e) => toast.error((e as Error).message),
                })
              }
              saving={upsert.isPending}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card className="divide-y">
              {kioskTx.length === 0 && (
                <p className="text-sm text-muted-foreground p-6 text-center">
                  Belum ada transaksi kiosk bulan ini.
                </p>
              )}
              {kioskTx.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">#{t.id.slice(-4).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleString("id-ID")} ·{" "}
                      {t.order_type === "kiosk-dinein" ? "Dine-in" : "Takeaway"}
                    </p>
                  </div>
                  <p className="font-bold">{formatRupiah(t.total)}</p>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

/* ----------------- Settings Form ----------------- */

import type { KioskSettings } from "@/hooks/useKiosk";

const SettingsForm = ({
  settings,
  onSave,
  saving,
}: {
  settings: KioskSettings | null | undefined;
  onSave: (patch: Partial<KioskSettings>) => void;
  saving: boolean;
}) => {
  const [form, setForm] = useState<Partial<KioskSettings>>({
    enabled: false,
    welcome_title: "Selamat Datang",
    welcome_subtitle: "Pesan dengan mudah, cepat, dan akurat",
    accent_color: "#2563EB",
    idle_timeout_seconds: 60,
    ask_order_type: true,
    ask_loyalty: false,
    payment_methods: ["cash", "qris"],
    success_message: "Terima kasih! Pesanan Anda sedang disiapkan.",
    terms: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        enabled: settings.enabled,
        welcome_title: settings.welcome_title,
        welcome_subtitle: settings.welcome_subtitle,
        accent_color: settings.accent_color,
        idle_timeout_seconds: settings.idle_timeout_seconds,
        ask_order_type: settings.ask_order_type,
        ask_loyalty: settings.ask_loyalty,
        payment_methods: settings.payment_methods,
        success_message: settings.success_message,
        terms: settings.terms || "",
      });
    }
  }, [settings]);

  const togglePm = (v: string) => {
    const cur = form.payment_methods || [];
    setForm({
      ...form,
      payment_methods: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
    });
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-bold">Aktifkan Kiosk</Label>
          <p className="text-xs text-muted-foreground">Jika nonaktif, halaman kiosk publik tidak bisa diakses.</p>
        </div>
        <Switch checked={!!form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
      </div>

      <div>
        <Label>Judul Welcome</Label>
        <Input value={form.welcome_title || ""} onChange={(e) => setForm({ ...form, welcome_title: e.target.value })} />
      </div>
      <div>
        <Label>Subjudul</Label>
        <Input value={form.welcome_subtitle || ""} onChange={(e) => setForm({ ...form, welcome_subtitle: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Warna Aksen</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.accent_color || "#2563EB"}
              onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
              className="h-10 w-14 rounded border border-input"
            />
            <Input value={form.accent_color || ""} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Idle Timeout (detik)</Label>
          <Input
            type="number"
            min={15}
            value={form.idle_timeout_seconds || 60}
            onChange={(e) => setForm({ ...form, idle_timeout_seconds: parseInt(e.target.value) || 60 })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Tanya Tipe Order (Dine-in / Takeaway)</Label>
        <Switch checked={!!form.ask_order_type} onCheckedChange={(v) => setForm({ ...form, ask_order_type: v })} />
      </div>

      <div>
        <Label className="block mb-2">Metode Pembayaran</Label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((p) => {
            const active = (form.payment_methods || []).includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePm(p.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Pesan Sukses</Label>
        <Textarea
          rows={2}
          value={form.success_message || ""}
          onChange={(e) => setForm({ ...form, success_message: e.target.value })}
        />
      </div>

      <div>
        <Label>Syarat & Ketentuan (opsional)</Label>
        <Textarea
          rows={3}
          value={form.terms || ""}
          onChange={(e) => setForm({ ...form, terms: e.target.value })}
        />
      </div>

      <div className="rounded-xl bg-muted/50 p-3">
        <p className="text-xs font-semibold mb-1">Segera Hadir</p>
        <p className="text-xs text-muted-foreground">
          Integrasi QRIS otomatis, cetak struk via Cloud Printer, dan multi-bahasa akan tersedia di iterasi berikutnya.
        </p>
      </div>

      <Button onClick={() => onSave(form)} disabled={saving} className="w-full">
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </Card>
  );
};

export default KioskPage;