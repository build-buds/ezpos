import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { useTransactions, useLast7DaysRevenue, TransactionPeriod } from "@/hooks/useTransactions";
import { useIsPro } from "@/hooks/useSubscription";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const periodMap: Record<string, TransactionPeriod> = {
  "Hari Ini": "today",
  "7 Hari": "week",
  "Bulan Ini": "month",
  "Tahun Ini": "year",
};

const allPeriods = ["Hari Ini", "7 Hari", "Bulan Ini", "Tahun Ini"];

const Reports = () => {
  const { businessCategory } = useAppState();
  const isPro = useIsPro();
  const navigate = useNavigate();
  const periods = isPro ? allPeriods : ["Hari Ini"];
  const [activePeriod, setActivePeriod] = useState("Hari Ini");
  const { data: transactions = [], isLoading } = useTransactions(periodMap[activePeriod]);
  const { data: last7Days = [] } = useLast7DaysRevenue();

  const headerColor = 'bg-primary';

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
  const txCount = transactions.length;
  const avgTx = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;

  const cashTotal = transactions.filter(tx => tx.payment_method === 'cash').reduce((s, tx) => s + (tx.total || 0), 0);
  const transferTotal = transactions.filter(tx => tx.payment_method === 'transfer').reduce((s, tx) => s + (tx.total || 0), 0);
  const bayarNantiTotal = transactions.filter(tx => tx.payment_method === 'bayar_nanti').reduce((s, tx) => s + (tx.total || 0), 0);

  const cashPct = totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0;
  const transferPct = totalRevenue > 0 ? Math.round((transferTotal / totalRevenue) * 100) : 0;
  const bayarNantiPct = totalRevenue > 0 ? Math.round((bayarNantiTotal / totalRevenue) * 100) : 0;

  // Real chart data
  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);
  const chartBars = last7Days.map((d, i) => ({
    height: Math.max(Math.round((d.revenue / maxRevenue) * 100), d.revenue > 0 ? 8 : 3),
    label: d.label,
    isToday: i === last7Days.length - 1,
  }));

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-4 text-primary-foreground", headerColor)}>
        <h1 className="text-lg md:text-xl font-bold">Laporan</h1>
        <p className="text-xs opacity-80">Ringkasan keuangan bisnis</p>
      </div>

      {!isPro && (
        <div className="px-5 md:px-8 lg:px-10 pt-3">
          <button
            onClick={() => navigate("/pricing")}
            className="w-full flex items-center justify-between p-3 bg-primary/10 rounded-xl text-xs"
          >
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> Laporan dasar saja (Paket Gratis)
            </span>
            <span className="text-primary font-bold">Upgrade →</span>
          </button>
        </div>
      )}

      <div className="px-5 md:px-8 lg:px-10 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {periods.map((p) => (
          <button key={p} onClick={() => setActivePeriod(p)} className={cn("px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors", activePeriod === p ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground")}>
            {p}
          </button>
        ))}
        {!isPro && allPeriods.filter(p => !periods.includes(p)).map((p) => (
          <button key={p} disabled className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-muted text-muted-foreground/40 flex items-center gap-1">
            <Lock className="w-3 h-3" />{p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="px-5 md:px-8 lg:px-10 space-y-4 lg:space-y-6 pb-4 lg:max-w-6xl">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <p className="text-[10px] text-muted-foreground">Pemasukan</p>
              </div>
              <p className="text-base font-extrabold text-success break-all">{formatRupiah(totalRevenue)}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground">Transaksi</p>
              </div>
              <p className="text-base font-extrabold text-foreground">{txCount}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground">Rata-rata</p>
              </div>
              <p className="text-base font-extrabold text-foreground break-all">{formatRupiah(avgTx)}</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 card-shadow">
            <p className="text-xs text-muted-foreground">Total Pendapatan ({activePeriod})</p>
            <p className="text-stat text-success">{formatRupiah(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{txCount} transaksi selesai</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <p className="text-sm font-semibold mb-3">Breakdown Metode Bayar</p>
              <div className="space-y-3">
                {[
                  { method: "Cash", amount: cashTotal, pct: cashPct, color: "bg-primary" },
                  { method: "Transfer", amount: transferTotal, pct: transferPct, color: "bg-accent" },
                  { method: "Bayar Nanti", amount: bayarNantiTotal, pct: bayarNantiPct, color: "bg-warning" },
                ].map((item) => (
                  <div key={item.method}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.pct}%</span>
                        <span className="font-bold text-foreground">{formatRupiah(item.amount)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Omzet 7 Hari Terakhir</p>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {chartBars.length > 0 ? chartBars.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={cn("w-full rounded-t-md", headerColor)}
                      style={{ height: `${bar.height}%`, opacity: bar.isToday ? 1 : 0.6 }}
                    />
                    <span className="text-[9px] text-muted-foreground">{bar.label}</span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground w-full text-center">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Reports;