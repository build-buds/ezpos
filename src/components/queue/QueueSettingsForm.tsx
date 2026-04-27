import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueueSettings, useUpsertQueueSettings, type QueueSettings } from "@/hooks/useQueue";

const defaults: Partial<QueueSettings> = {
  enabled: false,
  welcome_title: "Ambil Nomor Antrian",
  welcome_subtitle: "Daftar antrian dari HP Anda, tidak perlu mengantri",
  accent_color: "#2563EB",
  prefix: "A",
  ask_phone: true,
  ask_party_size: true,
  allow_preorder: false,
  avg_serve_minutes: 5,
  closed_message: "Mohon maaf, antrian sedang ditutup.",
  terms: "",
};

const QueueSettingsForm = () => {
  const { data: settings } = useQueueSettings();
  const upsert = useUpsertQueueSettings();
  const [form, setForm] = useState<Partial<QueueSettings>>(defaults);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const update = <K extends keyof QueueSettings>(k: K, v: QueueSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    try {
      await upsert.mutateAsync(form);
      toast.success("Pengaturan tersimpan");
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  return (
    <Card className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Aktifkan Antrian Publik</p>
          <p className="text-xs text-muted-foreground">Halaman antrian dapat diakses pelanggan via QR.</p>
        </div>
        <Switch checked={!!form.enabled} onCheckedChange={(v) => update("enabled", v)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Judul Welcome</Label>
          <Input value={form.welcome_title || ""} onChange={(e) => update("welcome_title", e.target.value)} />
        </div>
        <div>
          <Label>Subjudul</Label>
          <Input value={form.welcome_subtitle || ""} onChange={(e) => update("welcome_subtitle", e.target.value)} />
        </div>
        <div>
          <Label>Prefix Nomor (mis. A)</Label>
          <Input maxLength={3} value={form.prefix || ""} onChange={(e) => update("prefix", e.target.value.toUpperCase())} />
        </div>
        <div>
          <Label>Rata-rata Lama Layani (menit)</Label>
          <Input
            type="number"
            min={1}
            max={120}
            value={form.avg_serve_minutes ?? 5}
            onChange={(e) => update("avg_serve_minutes", Number(e.target.value) || 5)}
          />
        </div>
        <div>
          <Label>Warna Aksen</Label>
          <Input type="color" value={form.accent_color || "#2563EB"} onChange={(e) => update("accent_color", e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Tanya Nomor HP</Label>
          <Switch checked={!!form.ask_phone} onCheckedChange={(v) => update("ask_phone", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Tanya Jumlah Orang</Label>
          <Switch checked={!!form.ask_party_size} onCheckedChange={(v) => update("ask_party_size", v)} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Tampilkan tombol Pre-order Menu</Label>
          <Switch checked={!!form.allow_preorder} onCheckedChange={(v) => update("allow_preorder", v)} />
        </div>
      </div>

      <div>
        <Label>Pesan Saat Antrian Ditutup</Label>
        <Input value={form.closed_message || ""} onChange={(e) => update("closed_message", e.target.value)} />
      </div>

      <div>
        <Label>Syarat & Ketentuan (opsional)</Label>
        <Textarea rows={3} value={form.terms || ""} onChange={(e) => update("terms", e.target.value)} />
      </div>

      <Button onClick={onSave} disabled={upsert.isPending} className="w-full">
        {upsert.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
      </Button>
    </Card>
  );
};

export default QueueSettingsForm;