import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useIsPro } from "@/hooks/useSubscription";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const allPeriods = ["Hari Ini", "7 Hari", "Bulan Ini", "Tahun Ini"];

const Reports = () => {
  const { businessCategory } = useAppState();
  const isPro = useIsPro();
  const navigate = useNavigate();
  const periods = isPro ? allPeriods : ["Hari Ini"];
  const [activePeriod, setActivePeriod] = useState("Hari Ini");
  const { data: transactions = [], isLoading } = useTransactions(
    activePeriod === "Hari Ini" ? "today" : undefined
  );

  const headerColor = 'bg-primary';

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
  const txCount = transactions.length;

  const cashTotal = transactions.filter(tx => tx.payment_method === 'cash').reduce((s, tx) => s + (tx.total || 0), 0);
  const transferTotal = transactions.filter(tx => tx.payment_method === 'transfer').reduce((s, tx) => s + (tx.total || 0), 0);
  const bayarNantiTotal = transactions.filter(tx => tx.payment_method === 'bayar_nanti').reduce((s, tx) => s + (tx.total || 0), 0);

  const cashPct = totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0;
  const transferPct = totalRevenue > 0 ? Math.round((transferTotal / totalRevenue) * 100) : 0;
  const bayarNantiPct = totalRevenue > 0 ? Math.round((bayarNantiTotal / totalRevenue) * 100) : 0;

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <h1 className="text-lg md:text-xl font-bold">Laporan</h1>
        <p className="text-xs opacity-80">Ringkasan keuangan bisnis</p>
      </div>

      <div className="px-5 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {periods.map((p) => (
          <button key={p} onClick={() => setActivePeriod(p)} className={cn("px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors", activePeriod === p ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground")}>
            {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="px-5 md:px-8 space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <p className="text-xs text-muted-foreground">Pemasukan</p>
              </div>
              <p className="text-xl font-extrabold text-success">{formatRupiah(totalRevenue)}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Transaksi</p>
              </div>
              <p className="text-xl font-extrabold text-foreground">{txCount}</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 card-shadow">
            <p className="text-xs text-muted-foreground">Total Pendapatan</p>
            <p className="text-stat text-success">{formatRupiah(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{txCount} transaksi selesai</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-4 card-shadow">
              <p className="text-sm font-semibold mb-3">Breakdown Metode Bayar</p>
              <div className="space-y-2">
                {[
                  { method: "Cash", amount: cashTotal, pct: cashPct },
                  { method: "Transfer", amount: transferTotal, pct: transferPct },
                  { method: "Bayar Nanti", amount: bayarNantiTotal, pct: bayarNantiPct },
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

            <div className="bg-card rounded-2xl p-4 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Grafik Omzet</p>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {[65, 40, 80, 55, 90, 70, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn("w-full rounded-t-md", headerColor)} style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.6 }} />
                    <span className="text-[9px] text-muted-foreground">{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Reports;
