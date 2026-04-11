import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { X, Package, AlertTriangle, Clock, TrendingUp } from "lucide-react";

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
  const [settings, setSettings] = useState(loadSettings);

  if (!open) return null;

  const toggle = (key: string) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const items = [
    { key: "lowStock", icon: Package, label: "Stok Kritis", description: "Notifikasi saat stok produk di bawah minimum" },
    { key: "debtReminder", icon: AlertTriangle, label: "Hutang Jatuh Tempo", description: "Pengingat hutang pelanggan yang belum dibayar" },
    { key: "txAlert", icon: Clock, label: "Transaksi Baru", description: "Notifikasi setiap ada transaksi selesai" },
    { key: "dailySummary", icon: TrendingUp, label: "Ringkasan Harian", description: "Kirim ringkasan omzet di akhir hari" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-foreground/40" onClick={onClose} />
      <div className="bg-card rounded-t-3xl max-w-lg md:max-w-2xl mx-auto w-full animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-lg font-bold">Notifikasi</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Pengaturan notifikasi disimpan secara lokal di perangkat ini.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsNotification;
