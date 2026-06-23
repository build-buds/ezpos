import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChefHat, Clock, Loader2, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useKitchenOrders, useUpdateKitchenStatus, type KitchenStatus, type KitchenOrder } from "@/hooks/useKitchen";

type Tab = "pending" | "cooking" | "ready";

const TABS: { key: Tab; label: string; status: KitchenStatus }[] = [
  { key: "pending", label: "Baru", status: "pending" },
  { key: "cooking", label: "Dimasak", status: "cooking" },
  { key: "ready", label: "Siap", status: "ready" },
];

const elapsed = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const ageClass = (iso: string) => {
  const min = (Date.now() - new Date(iso).getTime()) / 60000;
  if (min > 10) return "text-destructive";
  if (min > 5) return "text-primary";
  return "text-muted-foreground";
};

const OrderCard = ({ order, onAdvance, onRevert, pending }: {
  order: KitchenOrder;
  onAdvance: () => void;
  onRevert?: () => void;
  pending: boolean;
}) => {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const advanceLabel: Record<KitchenStatus, string> = {
    pending: "Mulai Masak",
    cooking: "Tandai Siap",
    ready: "Selesai",
    served: "—",
  };

  return (
    <div className="bg-card rounded-2xl card-shadow p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">#{order.id.slice(0, 6).toUpperCase()}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{order.order_type || "kasir"}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 font-bold text-sm", ageClass(order.created_at))}>
          <Clock className="w-3.5 h-3.5" />
          {elapsed(order.created_at)}
        </div>
      </div>

      <ul className="space-y-1.5 flex-1 mb-3">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="font-bold text-primary w-7 shrink-0">{it.qty}×</span>
            <span className="text-foreground flex-1">{it.name}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {onRevert && (
          <Button variant="outline" className="flex-1 h-11" onClick={onRevert} disabled={pending}>
            Kembali
          </Button>
        )}
        <Button variant="cta" className="flex-1 h-11 font-bold" onClick={onAdvance} disabled={pending}>
          {advanceLabel[order.kitchen_status]}
        </Button>
      </div>
    </div>
  );
};

const KDS = () => {
  const [tab, setTab] = useState<Tab>("pending");
  const status = TABS.find((t) => t.key === tab)!.status;
  const { data: orders = [], isLoading } = useKitchenOrders(status);
  const update = useUpdateKitchenStatus();

  const advance: Record<KitchenStatus, KitchenStatus> = {
    pending: "cooking",
    cooking: "ready",
    ready: "served",
    served: "served",
  };
  const revert: Record<KitchenStatus, KitchenStatus | null> = {
    pending: null,
    cooking: "pending",
    ready: "cooking",
    served: null,
  };

  const handleAdvance = async (order: KitchenOrder) => {
    try {
      await update.mutateAsync({ id: order.id, status: advance[order.kitchen_status] });
      const msgs: Record<KitchenStatus, string> = {
        pending: "Pesanan diproses",
        cooking: "Pesanan siap disajikan",
        ready: "Pesanan selesai",
        served: "",
      };
      toast.success(msgs[order.kitchen_status]);
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleRevert = async (order: KitchenOrder) => {
    const prev = revert[order.kitchen_status];
    if (!prev) return;
    try {
      await update.mutateAsync({ id: order.id, status: prev });
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  return (
    <MobileLayout>
      <SEO title="Kitchen Display | EZPOS" description="Layar dapur digital real-time untuk memantau pesanan masuk." path="/kds" noIndex />

      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-4 bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            <h1 className="text-lg md:text-xl font-bold">Kitchen Display</h1>
          </div>
          <span className="text-xs bg-primary-foreground/20 px-2.5 py-1 rounded-full font-semibold">
            {orders.length} pesanan
          </span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                tab === t.key
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/15 text-primary-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Tidak ada pesanan</p>
            <p className="text-xs text-muted-foreground mt-1">Pesanan baru dari kasir akan muncul di sini secara otomatis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                pending={update.isPending}
                onAdvance={() => handleAdvance(o)}
                onRevert={revert[o.kitchen_status] ? () => handleRevert(o) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default KDS;