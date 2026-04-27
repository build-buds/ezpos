import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, CheckCircle2, SkipForward, Users, Clock } from "lucide-react";
import { useQueueTickets, useUpdateTicketStatus, type QueueTicket } from "@/hooks/useQueue";
import { toast } from "sonner";

const minutesAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "baru saja" : `${m} mnt`;
};

const QueueLiveBoard = () => {
  const { data: tickets = [], isLoading } = useQueueTickets("active");
  const update = useUpdateTicketStatus();

  const waiting = tickets.filter((t) => t.status === "waiting");
  const called = tickets.filter((t) => t.status === "called");

  const onAction = async (ticket: QueueTicket, status: "called" | "served" | "skipped") => {
    try {
      await update.mutateAsync({ id: ticket.id, status });
      toast.success(
        status === "called" ? `Memanggil ${ticket.number}` : status === "served" ? `${ticket.number} dilayani` : `${ticket.number} dilewati`
      );
    } catch (e) {
      toast.error("Gagal memperbarui antrian");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat antrian...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Menunggu</p>
          <p className="text-3xl font-extrabold">{waiting.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Dipanggil</p>
          <p className="text-3xl font-extrabold">{called.length}</p>
        </Card>
      </div>

      {called.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Sedang Dipanggil</h3>
          <div className="space-y-2">
            {called.map((t) => (
              <TicketCard key={t.id} ticket={t} onAction={onAction} highlighted />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Menunggu</h3>
        {waiting.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground text-sm">
            Belum ada antrian.
          </Card>
        ) : (
          <div className="space-y-2">
            {waiting.map((t) => (
              <TicketCard key={t.id} ticket={t} onAction={onAction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TicketCard = ({
  ticket,
  onAction,
  highlighted,
}: {
  ticket: QueueTicket;
  onAction: (t: QueueTicket, s: "called" | "served" | "skipped") => void;
  highlighted?: boolean;
}) => (
  <Card className={`p-4 ${highlighted ? "border-primary border-2" : ""}`}>
    <div className="flex items-center gap-3">
      <div className="text-center min-w-[64px]">
        <p className="text-2xl font-extrabold">{ticket.number}</p>
        {ticket.status === "called" && (
          <Badge variant="default" className="text-[10px] mt-1">Dipanggil</Badge>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{ticket.name}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {ticket.party_size && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ticket.party_size}</span>
          )}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{minutesAgo(ticket.created_at)}</span>
        </div>
        {ticket.note && <p className="text-xs text-muted-foreground mt-1 truncate">{ticket.note}</p>}
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-3">
      {ticket.status === "waiting" && (
        <Button size="sm" className="flex-1 min-w-[110px]" onClick={() => onAction(ticket, "called")}>
          <PhoneCall className="w-4 h-4 mr-1" />Panggil
        </Button>
      )}
      <Button size="sm" variant="secondary" className="flex-1 min-w-[110px]" onClick={() => onAction(ticket, "served")}>
        <CheckCircle2 className="w-4 h-4 mr-1" />Layani
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onAction(ticket, "skipped")} aria-label="Lewati">
        <SkipForward className="w-4 h-4" />
      </Button>
    </div>
  </Card>
);

export default QueueLiveBoard;