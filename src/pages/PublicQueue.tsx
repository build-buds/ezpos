import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2, CheckCircle2, PhoneCall, Clock, X, Utensils } from "lucide-react";
import { toast } from "sonner";
import {
  usePublicQueueSettings,
  createPublicQueueTicket,
  usePublicTicket,
  cancelPublicTicket,
} from "@/hooks/useQueue";

type Stage = "welcome" | "form" | "status";

const STORAGE_KEY = (slug: string) => `queue_ticket_${slug}`;

const PublicQueuePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicQueueSettings(slug);
  const [stage, setStage] = useState<Stage>("welcome");
  const [ticketId, setTicketId] = useState<string | null>(null);

  // restore ticket from localStorage
  useEffect(() => {
    if (!slug) return;
    const saved = localStorage.getItem(STORAGE_KEY(slug));
    if (saved) {
      setTicketId(saved);
      setStage("status");
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="p-8 max-w-md text-center space-y-2">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground" />
          <h1 className="text-lg font-bold">Antrian Tidak Tersedia</h1>
          <p className="text-sm text-muted-foreground">
            Halaman antrian ini sedang tidak aktif. Silakan hubungi staff di tempat.
          </p>
        </Card>
      </div>
    );
  }

  const { business, settings } = data;
  const accent = settings.accent_color || "#2563EB";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b" style={{ borderColor: `${accent}33` }}>
        <p className="text-xs text-muted-foreground">Antrian</p>
        <h1 className="text-base sm:text-lg font-bold truncate">{business.name}</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md md:max-w-lg">
          {stage === "welcome" && (
            <WelcomeStage
              title={settings.welcome_title}
              subtitle={settings.welcome_subtitle}
              accent={accent}
              onStart={() => setStage("form")}
            />
          )}
          {stage === "form" && (
            <FormStage
              accent={accent}
              askPhone={settings.ask_phone}
              askPartySize={settings.ask_party_size}
              terms={settings.terms}
              onCancel={() => setStage("welcome")}
              onSubmit={async (payload) => {
                try {
                  const res = await createPublicQueueTicket({ business_id: business.id, ...payload });
                  if (slug) localStorage.setItem(STORAGE_KEY(slug), res.id);
                  setTicketId(res.id);
                  setStage("status");
                  toast.success(`Nomor antrian Anda: ${res.number}`);
                } catch (e) {
                  toast.error((e as Error).message || "Gagal mendaftar antrian");
                }
              }}
            />
          )}
          {stage === "status" && ticketId && (
            <StatusStage
              ticketId={ticketId}
              businessId={business.id}
              accent={accent}
              avgServeMinutes={settings.avg_serve_minutes}
              menuSlug={settings.allow_preorder ? slug : undefined}
              onLeave={() => {
                if (slug) localStorage.removeItem(STORAGE_KEY(slug));
                setTicketId(null);
                setStage("welcome");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const WelcomeStage = ({
  title,
  subtitle,
  accent,
  onStart,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onStart: () => void;
}) => (
  <div className="text-center space-y-6">
    <div
      className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
      style={{ backgroundColor: `${accent}1A`, color: accent }}
    >
      <Bell className="w-10 h-10" />
    </div>
    <div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
    </div>
    <Button
      size="lg"
      className="w-full h-14 text-base"
      style={{ backgroundColor: accent, color: "white" }}
      onClick={onStart}
    >
      Ambil Nomor Antrian
    </Button>
  </div>
);

const FormStage = ({
  accent,
  askPhone,
  askPartySize,
  terms,
  onSubmit,
  onCancel,
}: {
  accent: string;
  askPhone: boolean;
  askPartySize: boolean;
  terms: string | null;
  onSubmit: (p: { name: string; phone?: string; party_size?: number; note?: string }) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState<number>(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      phone: askPhone ? phone.trim() || undefined : undefined,
      party_size: askPartySize ? size : undefined,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
  };

  return (
    <Card className="p-5 space-y-4">
      <h2 className="text-lg font-bold">Data Pemesan</h2>
      <div>
        <Label>Nama</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" autoFocus />
      </div>
      {askPhone && (
        <div>
          <Label>No. WhatsApp (opsional)</Label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812..." />
        </div>
      )}
      {askPartySize && (
        <div>
          <Label>Jumlah Orang</Label>
          <div className="flex items-center gap-3 mt-1">
            <Button variant="outline" size="icon" onClick={() => setSize((s) => Math.max(1, s - 1))}>-</Button>
            <span className="text-2xl font-bold w-10 text-center">{size}</span>
            <Button variant="outline" size="icon" onClick={() => setSize((s) => Math.min(20, s + 1))}>+</Button>
          </div>
        </div>
      )}
      <div>
        <Label>Catatan (opsional)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Permintaan khusus..." />
      </div>
      {terms && <p className="text-[11px] text-muted-foreground">{terms}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Batal</Button>
        <Button
          className="flex-1 h-12"
          style={{ backgroundColor: accent, color: "white" }}
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Memproses..." : "Daftar Antrian"}
        </Button>
      </div>
    </Card>
  );
};

const StatusStage = ({
  ticketId,
  businessId,
  accent,
  avgServeMinutes,
  menuSlug,
  onLeave,
}: {
  ticketId: string;
  businessId: string;
  accent: string;
  avgServeMinutes: number;
  menuSlug?: string;
  onLeave: () => void;
}) => {
  const { data, isLoading } = usePublicTicket(ticketId, businessId);

  if (isLoading || !data) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const { ticket, ahead } = data;
  const eta = ahead * Math.max(avgServeMinutes, 1);

  if (ticket.status === "served") {
    return (
      <Card className="p-6 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
        <h2 className="text-xl font-bold">Selesai</h2>
        <p className="text-sm text-muted-foreground">Terima kasih telah menggunakan layanan kami!</p>
        <Button onClick={onLeave} className="w-full">Tutup</Button>
      </Card>
    );
  }

  if (ticket.status === "cancelled" || ticket.status === "skipped") {
    return (
      <Card className="p-6 text-center space-y-3">
        <X className="w-12 h-12 mx-auto text-destructive" />
        <h2 className="text-xl font-bold">
          Antrian {ticket.status === "cancelled" ? "Dibatalkan" : "Dilewati"}
        </h2>
        <Button onClick={onLeave} className="w-full">Ambil Nomor Baru</Button>
      </Card>
    );
  }

  const isCalled = ticket.status === "called";

  return (
    <Card className="p-6 space-y-5 text-center">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Nomor Antrian Anda</p>
      <p className="text-6xl font-extrabold" style={{ color: accent }}>
        {ticket.number}
      </p>
      <p className="text-sm font-medium">{ticket.name}</p>

      {isCalled ? (
        <div className="rounded-lg p-4 animate-pulse" style={{ backgroundColor: `${accent}1A` }}>
          <PhoneCall className="w-6 h-6 mx-auto mb-2" style={{ color: accent }} />
          <p className="text-base font-bold" style={{ color: accent }}>
            Giliran Anda Sekarang!
          </p>
          <p className="text-xs text-muted-foreground mt-1">Silakan menuju ke kasir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3 bg-muted">
            <p className="text-xs text-muted-foreground">Posisi</p>
            <p className="text-2xl font-bold">#{ahead + 1}</p>
          </div>
          <div className="rounded-lg p-3 bg-muted">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />Estimasi
            </p>
            <p className="text-2xl font-bold">{eta}m</p>
          </div>
        </div>
      )}

      {!isCalled && <Badge variant="secondary">Menunggu</Badge>}

      <div className="space-y-2 pt-2">
        {menuSlug && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`/menu/${menuSlug}`, "_blank")}
          >
            <Utensils className="w-4 h-4 mr-2" />
            Pesan Sambil Menunggu
          </Button>
        )}
        <Button
          variant="ghost"
          className="w-full text-destructive"
          onClick={async () => {
            try {
              await cancelPublicTicket(ticketId);
              toast.success("Antrian dibatalkan");
            } catch {
              toast.error("Gagal membatalkan");
            }
          }}
        >
          Batalkan Antrian
        </Button>
      </div>
    </Card>
  );
};

export default PublicQueuePage;