import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Package, AlertTriangle, Clock, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsSheet from "./SettingsSheet";
import { useAppState } from "@/contexts/AppContext";
import { subscribeToPush, unsubscribeFromPush, isPushSupported, getPushPermission } from "@/lib/pushNotifications";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "ezpos_notif_settings";

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lowStock: true, debtReminder: true, dailySummary: false, txAlert: true };
};

const SettingsNotification = ({ open, onClose }: Props) => {
  const { user } = useAppState();
  const [settings, setSettings] = useState(loadSettings);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const pushSupported = isPushSupported();

  useEffect(() => {
    if (pushSupported) {
      setPushEnabled(getPushPermission() === "granted");
    }
  }, [pushSupported]);

  const toggle = (key: string) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handlePushToggle = async () => {
    if (!user) {
      toast.error("Kamu harus login terlebih dahulu");
      return;
    }
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast.success("Push notification dinonaktifkan");
      } else {
        const success = await subscribeToPush(user.id);
        if (success) {
          setPushEnabled(true);
          toast.success("Push notification diaktifkan!");
        } else {
          toast.error("Gagal mengaktifkan push notification. Pastikan kamu mengizinkan notifikasi.");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    setPushLoading(false);
  };

  const items = [
    { key: "lowStock", icon: Package, label: "Stok Kritis", description: "Notifikasi saat stok produk di bawah minimum" },
    { key: "debtReminder", icon: AlertTriangle, label: "Hutang Jatuh Tempo", description: "Pengingat hutang pelanggan yang belum dibayar" },
    { key: "txAlert", icon: Clock, label: "Transaksi Baru", description: "Notifikasi setiap ada transaksi selesai" },
    { key: "dailySummary", icon: TrendingUp, label: "Ringkasan Harian", description: "Kirim ringkasan omzet di akhir hari" },
  ];

  return (
    <SettingsSheet open={open} onClose={onClose} title="Notifikasi">
      <div className="space-y-3">
        {/* Push Notification Toggle */}
        {pushSupported && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Bell className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Push Notification</p>
                  <p className="text-xs text-muted-foreground">Terima notifikasi meskipun app tidak dibuka</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={pushEnabled ? "outline" : "default"}
                className="shrink-0 h-8 text-xs"
                onClick={handlePushToggle}
                disabled={pushLoading}
              >
                {pushLoading ? "..." : pushEnabled ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </div>
          </div>
        )}

        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
              <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} className="shrink-0" />
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Push notification hanya bekerja di versi published. Pengaturan lain disimpan lokal.
        </p>
      </div>
    </SettingsSheet>
  );
};

export default SettingsNotification;
