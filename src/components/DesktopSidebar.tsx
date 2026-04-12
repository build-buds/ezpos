import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppContext";
import brandIcon from "@/assets/logo.png";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "Kasir", icon: ShoppingCart },
  { path: "/products", label: "Produk", icon: Package },
  { path: "/reports", label: "Laporan", icon: FileText },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessName } = useAppState();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
        <img src={brandIcon} alt="EZPOS" className="w-9 h-9 object-contain" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{businessName || "EZPOS"}</p>
          <p className="text-[10px] text-muted-foreground">Point of Sale</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">EZPOS v1.0</p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;