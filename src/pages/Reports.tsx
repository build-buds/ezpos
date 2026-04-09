import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useState } from "react";

const periods = ["Hari Ini", "7 Hari", "Bulan Ini", "Tahun Ini"];

const Reports = () => {
  const { businessCategory } = useAppState();
  const [activePeriod, setActivePeriod] = useState("Hari Ini");

  const headerColor = businessCategory === 'restoran'
    ? 'bg-restoran'
    : businessCategory === 'onlineshop'
    ? 'bg-onlineshop'
    : 'bg-primary';

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <h1 className="text-lg md:text-xl font-bold">Laporan</h1>
        <p className="text-xs opacity-80">Ringkasan keuangan bisnis</p>
      </div>

      {/* Period Tabs */}
      <div className="px-5 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activePeriod === p ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="px-5 md:px-8 space-y-4 pb-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Pemasukan</p>
            </div>
            <p className="text-xl font-extrabold text-success">{formatRupiah(1250000)}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Pengeluaran</p>
            </div>
            <p className="text-xl font-extrabold text-destructive">{formatRupiah(320000)}</p>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <p className="text-xs text-muted-foreground">Estimasi Laba</p>
          <p className="text-stat text-success">{formatRupiah(930000)}</p>
          <p className="text-xs text-muted-foreground mt-1">24 transaksi selesai</p>
        </div>

        {/* Two-column on tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Breakdown */}
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <p className="text-sm font-semibold mb-3">Breakdown Metode Bayar</p>
            <div className="space-y-2">
              {[
                { method: "Cash", amount: 850000, pct: 68 },
                { method: "Transfer", amount: 300000, pct: 24 },
                { method: "Bayar Nanti", amount: 100000, pct: 8 },
              ].map((item) => (
                <div key={item.method}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.method}</span>
                    <span className="font-bold">{formatRupiah(item.amount)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", headerColor)} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-card rounded-2xl p-4 card-shadow">
            <p className="text-sm font-semibold mb-3">Produk Terlaris</p>
            <div className="space-y-2">
              {[
                { rank: 1, name: "Nasi Goreng Spesial", qty: 45, revenue: 1125000 },
                { rank: 2, name: "Es Teh Manis", qty: 38, revenue: 190000 },
                { rank: 3, name: "Ayam Geprek", qty: 30, revenue: 660000 },
              ].map((item) => (
                <div key={item.rank} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground",
                    item.rank === 1 ? "bg-warning" : item.rank === 2 ? "bg-muted-foreground" : "bg-onlineshop"
                  )}>
                    {item.rank}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.qty} terjual</p>
                  </div>
                  <p className="text-sm font-bold">{formatRupiah(item.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Grafik Omzet</p>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {[65, 40, 80, 55, 90, 70, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn("w-full rounded-t-md", headerColor)} style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.6 }} />
                <span className="text-[9px] text-muted-foreground">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Reports;
