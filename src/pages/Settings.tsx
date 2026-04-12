import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { User, Store, Bell, Palette, LogOut, ChevronRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsProfile from "@/components/settings/SettingsProfile";
import SettingsBusiness from "@/components/settings/SettingsBusiness";
import SettingsNotification from "@/components/settings/SettingsNotification";
import SettingsAppearance from "@/components/settings/SettingsAppearance";

const Settings = () => {
  const { businessName, user, logout } = useAppState();
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const headerColor = 'bg-primary';

  const handleLogout = async () => {
    await logout();
    navigate("/auth", { replace: true });
  };

  const menuItems = [
    { key: "profile", icon: User, label: "Profil Akun", description: "Email, nama, foto profil" },
    { key: "business", icon: Store, label: "Pengaturan Bisnis", description: "Nama, alamat, metode bayar" },
    { key: "notification", icon: Bell, label: "Notifikasi", description: "Stok kritis, hutang jatuh tempo" },
    { key: "appearance", icon: Palette, label: "Tampilan", description: "Tema, bahasa" },
  ];

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-6 text-primary-foreground", headerColor)}>
        <h1 className="text-lg md:text-xl font-bold">Pengaturan</h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold">{businessName || "EZPOS"}</p>
            <p className="text-xs opacity-80">{user?.email || "-"}</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 py-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSheet(item.key)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl card-shadow"
          >
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => navigate("/pricing")}
          className="w-full flex items-center gap-3 p-4 bg-primary/10 rounded-2xl card-shadow"
        >
          <Crown className="w-5 h-5 text-primary" />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-primary">Upgrade ke Pro</p>
            <p className="text-xs text-muted-foreground">Rp 299.000/bulan</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl card-shadow md:col-span-2"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Keluar</span>
        </button>
      </div>

      <SettingsProfile open={activeSheet === "profile"} onClose={() => setActiveSheet(null)} />
      <SettingsBusiness open={activeSheet === "business"} onClose={() => setActiveSheet(null)} />
      <SettingsNotification open={activeSheet === "notification"} onClose={() => setActiveSheet(null)} />
      <SettingsAppearance open={activeSheet === "appearance"} onClose={() => setActiveSheet(null)} />
    </MobileLayout>
  );
};

export default Settings;
