import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueueTickets } from "@/hooks/useQueue";

const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  served: { label: "Dilayani", variant: "default" },
  skipped: { label: "Dilewati", variant: "secondary" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
};

const QueueHistory = () => {
  const { data: tickets = [] } = useQueueTickets("history");

  const served = tickets.filter((t) => t.status === "served");
  const noShow = tickets.filter((t) => t.status === "skipped" || t.status === "cancelled").length;
  const noShowRate = tickets.length > 0 ? Math.round((noShow / tickets.length) * 100) : 0;

  const avgWaitMin =
    served.length > 0
      ? Math.round(
          served.reduce((sum, t) => {
            const start = new Date(t.created_at).getTime();
            const end = new Date(t.served_at || t.updated_at).getTime();
            return sum + (end - start) / 60000;
          }, 0) / served.length
        )
      : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Total 7 hari</p>
          <p className="text-2xl font-extrabold">{tickets.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Rata-rata Tunggu</p>
          <p className="text-2xl font-extrabold">{avgWaitMin}m</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">No-show</p>
          <p className="text-2xl font-extrabold">{noShowRate}%</p>
        </Card>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">Belum ada riwayat antrian.</Card>
      ) : (
        <Card className="divide-y">
          {tickets.map((t) => {
            const s = statusLabel[t.status] || { label: t.status, variant: "secondary" as const };
            return (
              <div key={t.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {t.number} <span className="font-normal text-muted-foreground">— {t.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

export default QueueHistory;