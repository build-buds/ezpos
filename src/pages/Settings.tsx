import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { User, Store, Bell, Palette, LogOut, ChevronRight, Crown, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SettingsProfile from "@/components/settings/SettingsProfile";
import SettingsBusiness from "@/components/settings/SettingsBusiness";
import SettingsNotification from "@/components/settings/SettingsNotification";
import SettingsAppearance from "@/components/settings/SettingsAppearance";

const Settings = () => {
  const { businessName, user, logout } = useAppState();
  const { data: subscription } = useSubscription();
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

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
      <div className={cn("px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-6 text-primary-foreground bg-primary")}>
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

      <div className="px-5 md:px-8 lg:px-10 py-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:max-w-4xl">
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

        {isPro ? (
          <div className="w-full flex items-center gap-3 p-4 bg-primary/10 rounded-2xl card-shadow">
            <Crown className="w-5 h-5 text-primary" />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary">EZPOS Pro</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  <CheckCircle className="w-3 h-3" />
                  Aktif
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription?.expires_at
                  ? `Berlaku hingga ${new Date(subscription.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                  : "Langganan aktif"}
              </p>
            </div>
          </div>
        ) : (
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
        )}

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
