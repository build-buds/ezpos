import MobileLayout from "@/components/MobileLayout";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationBell from "@/components/NotificationBell";
import { useAppState } from "@/contexts/AppContext";
import { useTransactions } from "@/hooks/useTransactions";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  ShoppingCart, Package, FileText, Users, AlertTriangle,
  ArrowRight, BarChart3, Utensils, Store, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { businessCategory, businessName } = useAppState();
  const { data: todayTx = [], isLoading } = useTransactions("today");
  const navigate = useNavigate();

  const headerColor = 'bg-primary';

  const categoryIcon = businessCategory === 'restoran'
    ? Utensils
    : businessCategory === 'onlineshop'
    ? Package
    : Store;
  const CatIcon = categoryIcon;

  const todayRevenue = todayTx.reduce((sum, tx) => sum + (tx.total || 0), 0);
  const txCount = todayTx.length;
  const avgTx = txCount > 0 ? Math.round(todayRevenue / txCount) : 0;

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-6 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Selamat datang</p>
            <h1 className="text-xl md:text-2xl font-bold mt-0.5">{businessName || "EZPOS"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <CatIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 -mt-3 space-y-4 pb-4">
        <InstallPrompt />
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <p className="text-xs text-muted-foreground font-medium">Omzet Hari Ini</p>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary mt-2" />
          ) : (
            <>
              <p className="text-stat text-foreground mt-1">{formatRupiah(todayRevenue)}</p>
              <div className="flex items-center gap-4 md:gap-8 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Transaksi</p>
                  <p className="text-lg font-bold">{txCount}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata</p>
                  <p className="text-lg font-bold">{formatRupiah(avgTx)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: ShoppingCart, label: "Kasir", path: "/pos" },
            { icon: Package, label: "Produk", path: "/products" },
            { icon: Users, label: "Hutang", path: "/reports" },
            { icon: FileText, label: "Laporan", path: "/reports" },
          ].map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-1.5 p-3 md:p-4 bg-card rounded-2xl card-shadow hover:scale-105 transition-transform">
              <action.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              <span className="text-[11px] md:text-xs font-semibold text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <p className="text-sm font-semibold">Stok Kritis</p>
              </div>
              <button onClick={() => navigate("/products")} className="text-xs text-primary font-medium flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Data akan muncul dari produk yang stoknya rendah</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Omzet 7 Hari</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {[65, 40, 80, 55, 90, 70, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn("w-full rounded-t-md", headerColor)} style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.5 }} />
                  <span className="text-[9px] text-muted-foreground">{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
