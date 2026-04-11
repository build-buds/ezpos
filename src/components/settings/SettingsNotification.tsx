import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Package, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import SettingsSheet from "./SettingsSheet";

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
    <SettingsSheet open={open} onClose={onClose} title="Notifikasi">
      <div className="space-y-3">
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
          Pengaturan notifikasi disimpan secara lokal di perangkat ini.
        </p>
      </div>
    </SettingsSheet>
  );
};

export default SettingsNotification;
