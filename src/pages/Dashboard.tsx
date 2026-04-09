import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  ShoppingCart, Package, FileText, Users, TrendingUp, AlertTriangle,
  ArrowRight, BarChart3, Utensils, Store
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { businessCategory, businessName } = useAppState();
  const navigate = useNavigate();

  const headerColor = businessCategory === 'restoran'
    ? 'bg-restoran'
    : businessCategory === 'onlineshop'
    ? 'bg-onlineshop'
    : 'bg-primary';

  const categoryIcon = businessCategory === 'restoran'
    ? Utensils
    : businessCategory === 'onlineshop'
    ? Package
    : Store;
  const CatIcon = categoryIcon;

  return (
    <MobileLayout>
      {/* Header */}
      <div className={cn("px-5 md:px-8 pt-10 pb-6 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Selamat datang</p>
            <h1 className="text-xl md:text-2xl font-bold mt-0.5">{businessName || "EASYPOS"}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <CatIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 -mt-3 space-y-4 pb-4">
        {/* Revenue Card */}
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <p className="text-xs text-muted-foreground font-medium">Omzet Hari Ini</p>
          <p className="text-stat text-foreground mt-1">{formatRupiah(1250000)}</p>
          <div className="flex items-center gap-4 md:gap-8 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Transaksi</p>
              <p className="text-lg font-bold">24</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Rata-rata</p>
              <p className="text-lg font-bold">{formatRupiah(52083)}</p>
            </div>
            {businessCategory !== 'onlineshop' && (
              <>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Piutang</p>
                  <p className="text-lg font-bold text-destructive">{formatRupiah(150000)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: ShoppingCart, label: "Kasir", path: "/pos" },
            { icon: Package, label: "Produk", path: "/products" },
            { icon: Users, label: "Hutang", path: "/reports" },
            { icon: FileText, label: "Laporan", path: "/reports" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 p-3 md:p-4 bg-card rounded-2xl card-shadow hover:scale-105 transition-transform"
            >
              <action.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              <span className="text-[11px] md:text-xs font-semibold text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Two-column grid for tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock Alert */}
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
              {[
                { name: "Es Teh Manis", stock: 3, min: 20 },
                { name: "Indomie Goreng", stock: 5, min: 10 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    Sisa {item.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Chart */}
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
                  <div
                    className={cn("w-full rounded-t-md", headerColor)}
                    style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.5 }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant-specific: Active Orders */}
        {businessCategory === 'restoran' && (
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Order Aktif</p>
              <span className="text-xs font-bold text-primary-foreground bg-restoran px-2 py-0.5 rounded-full">3 order</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { table: "Meja 1", status: "Diproses", color: "bg-warning/20 text-warning" },
                { table: "Meja 3", status: "Siap Bayar", color: "bg-success/20 text-success" },
                { table: "Take Away", status: "Diproses", color: "bg-warning/20 text-warning" },
              ].map((order) => (
                <div key={order.table} className="p-3 bg-muted rounded-xl text-center">
                  <p className="text-xs font-bold">{order.table}</p>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block", order.color)}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Online Shop specific: Financial Summary */}
        {businessCategory === 'onlineshop' && (
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <p className="text-sm font-semibold mb-3">Ringkasan Finansial</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Modal Awal</span>
                <span className="text-sm font-bold">{formatRupiah(5000000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pemasukan</span>
                <span className="text-sm font-bold text-success">{formatRupiah(1250000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pengeluaran</span>
                <span className="text-sm font-bold text-destructive">{formatRupiah(320000)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-sm font-semibold">Estimasi Laba</span>
                <span className="text-sm font-bold text-success">{formatRupiah(930000)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
