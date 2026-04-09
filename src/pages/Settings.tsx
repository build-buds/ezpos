import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { User, Store, Bell, Palette, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const { businessCategory, businessName, logout } = useAppState();
  const navigate = useNavigate();

  const headerColor = businessCategory === 'restoran'
    ? 'bg-restoran'
    : businessCategory === 'onlineshop'
    ? 'bg-onlineshop'
    : 'bg-primary';

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const menuItems = [
    { icon: User, label: "Profil Akun", description: "Email, nama, foto profil" },
    { icon: Store, label: "Pengaturan Bisnis", description: "Nama, alamat, metode bayar" },
    { icon: Bell, label: "Notifikasi", description: "Stok kritis, hutang jatuh tempo" },
    { icon: Palette, label: "Tampilan", description: "Tema, bahasa" },
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
            <p className="text-base font-bold">{businessName || "EASYPOS"}</p>
            <p className="text-xs opacity-80">owner@email.com</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 py-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {menuItems.map((item) => (
          <button key={item.label} onClick={() => toast.info(`${item.label} — Fitur segera hadir!`)} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl card-shadow">
            <item.icon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl card-shadow md:col-span-2"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-semibold text-destructive">Keluar</span>
        </button>
      </div>
    </MobileLayout>
  );
};

export default Settings;
