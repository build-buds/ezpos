import { forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "Kasir", icon: ShoppingCart },
  { path: "/products", label: "Produk", icon: Package },
  { path: "/reports", label: "Laporan", icon: FileText },
  { path: "/settings", label: "Lainnya", icon: Settings },
];

const BottomNav = forwardRef<HTMLElement>((_, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessCategory } = useAppState();

  const activeColor = businessCategory === 'restoran'
    ? 'text-restoran'
    : businessCategory === 'onlineshop'
    ? 'text-onlineshop'
    : 'text-primary';

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? activeColor : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
