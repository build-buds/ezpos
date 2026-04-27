import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Users,
  Ticket,
  Settings as SettingsIcon,
  Plus,
  Search,
  Phone,
  Trash2,
  Award,
  TrendingUp,
  Gift,
  Sparkles,
  Pencil,
  Mail as MailIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/data/products";
import { cn } from "@/lib/utils";
import {
  useLoyaltySettings,
  useUpsertLoyaltySettings,
  useLoyaltyMembers,
  useCreateMember,
  useDeleteMember,
  useMemberTransactions,
  useAdjustPoints,
  useLoyaltyVouchers,
  useUpsertVoucher,
  useDeleteVoucher,
  type LoyaltyMember,
  type LoyaltyTier,
  type LoyaltyVoucher,
} from "@/hooks/useLoyalty";

const tierStyles: Record<LoyaltyTier, { label: string; cls: string }> = {
  bronze: { label: "Bronze", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  silver: { label: "Silver", cls: "bg-slate-400/15 text-slate-700 border-slate-400/30" },
  gold: { label: "Gold", cls: "bg-yellow-400/15 text-yellow-700 border-yellow-500/40" },
};

const Loyalty = () => {
  const { data: settings } = useLoyaltySettings();
  const { data: members = [] } = useLoyaltyMembers();
  const { data: vouchers = [] } = useLoyaltyVouchers();

  const totalPoints = members.reduce((s, m) => s + m.points_balance, 0);
  const totalSpent = members.reduce((s, m) => s + m.total_spent_rupiah, 0);
  const activeVouchers = vouchers.filter((v) => v.active).length;
  const topMembers = [...members].sort((a, b) => b.total_spent_rupiah - a.total_spent_rupiah).slice(0, 5);

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-6 text-primary-foreground bg-primary">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-bold">Loyalty Programme</h1>
        </div>
        <p className="mt-1 text-xs opacity-80">
          Member digital, poin otomatis, dan voucher untuk meningkatkan retensi pelanggan.
        </p>
        {settings && !settings.enabled && (
          <div className="mt-3 p-2.5 rounded-lg bg-primary-foreground/15 text-xs">
            ⚠️ Program loyalty masih nonaktif. Aktifkan di tab <strong>Pengaturan</strong>.
          </div>
        )}
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-4 lg:max-w-5xl lg:mx-auto pb-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="dashboard" className="text-xs"><TrendingUp className="w-3.5 h-3.5 mr-1" />Ringkasan</TabsTrigger>
            <TabsTrigger value="members" className="text-xs"><Users className="w-3.5 h-3.5 mr-1" />Member</TabsTrigger>
            <TabsTrigger value="vouchers" className="text-xs"><Ticket className="w-3.5 h-3.5 mr-1" />Voucher</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs"><SettingsIcon className="w-3.5 h-3.5 mr-1" />Atur</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Users className="w-4 h-4" />} label="Total Member" value={members.length.toString()} />
              <StatCard icon={<Award className="w-4 h-4" />} label="Poin Beredar" value={totalPoints.toLocaleString("id-ID")} />
              <StatCard icon={<Ticket className="w-4 h-4" />} label="Voucher Aktif" value={activeVouchers.toString()} />
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Belanja" value={formatRupiah(totalSpent)} />
            </div>

            <Card className="p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> Top 5 Member</h3>
              {topMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Belum ada member</p>
              ) : (
                <div className="space-y-2">
                  {topMembers.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.visit_count} kunjungan</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] capitalize", tierStyles[m.tier].cls)}>{tierStyles[m.tier].label}</Badge>
                      <p className="text-xs font-bold w-24 text-right">{formatRupiah(m.total_spent_rupiah)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Gift className="w-4 h-4 text-primary" /> Tip</p>
              <p className="text-xs text-muted-foreground mt-1">
                Saat checkout di kasir, masukkan no HP pelanggan untuk otomatis memberi poin & menukar voucher.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <MembersTab members={members} />
          </TabsContent>

          <TabsContent value="vouchers">
            <VouchersTab vouchers={vouchers} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card className="p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">{icon}<span>{label}</span></div>
    <p className="text-base md:text-lg font-extrabold mt-1 text-foreground truncate">{value}</p>
  </Card>
);

/* -------------------- MEMBERS -------------------- */
const MembersTab = ({ members }: { members: LoyaltyMember[] }) => {
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<LoyaltyMember | null>(null);
  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / no HP..." className="pl-9 h-10" />
        </div>
        <Button onClick={() => setOpenAdd(true)} className="h-10"><Plus className="w-4 h-4 mr-1" />Member</Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-semibold">Belum ada member</p>
          <p className="text-xs text-muted-foreground mt-1">Tambahkan member pertama Anda atau biarkan terdaftar otomatis dari kasir.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => setSelected(m)} className="w-full text-left bg-card rounded-2xl card-shadow p-3.5 flex items-center gap-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{m.name}</p>
                  <Badge variant="outline" className={cn("text-[9px] py-0 px-1.5 h-4 capitalize", tierStyles[m.tier].cls)}>{tierStyles[m.tier].label}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {m.phone}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-primary">{m.points_balance.toLocaleString("id-ID")}</p>
                <p className="text-[10px] text-muted-foreground">poin</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <AddMemberDialog open={openAdd} onClose={() => setOpenAdd(false)} />
      <MemberDetailSheet member={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

const AddMemberDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const create = useCreateMember();

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Nama dan no HP wajib diisi");
      return;
    }
    try {
      await create.mutateAsync({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, birthday: birthday || undefined });
      toast.success("Member ditambahkan");
      setName(""); setPhone(""); setEmail(""); setBirthday("");
      onClose();
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Nomor HP sudah terdaftar" : "Gagal menambah member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Tambah Member</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nama *</Label><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
          <div><Label>No HP *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxx" maxLength={20} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} /></div>
          <div><Label>Tanggal Lahir</Label><Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={create.isPending}>{create.isPending ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MemberDetailSheet = ({ member, onClose }: { member: LoyaltyMember | null; onClose: () => void }) => {
  const { data: txns = [] } = useMemberTransactions(member?.id || null);
  const adjust = useAdjustPoints();
  const del = useDeleteMember();
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");

  if (!member) return null;

  const handleAdjust = async () => {
    const n = parseInt(delta);
    if (isNaN(n) || n === 0) {
      toast.error("Masukkan jumlah poin (boleh negatif)");
      return;
    }
    try {
      await adjust.mutateAsync({ memberId: member.id, delta: n, note: note || "Penyesuaian manual" });
      toast.success("Poin diperbarui");
      setDelta(""); setNote("");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyesuaikan");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus member ${member.name}?`)) return;
    try {
      await del.mutateAsync(member.id);
      toast.success("Member dihapus");
      onClose();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader><SheetTitle className="text-left">{member.name}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <Card className="p-4 bg-primary text-primary-foreground">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] opacity-80">Saldo Poin</p>
                <p className="text-3xl font-extrabold mt-1">{member.points_balance.toLocaleString("id-ID")}</p>
              </div>
              <Badge className={cn("capitalize bg-primary-foreground text-primary")}>{tierStyles[member.tier].label}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div><p className="opacity-70">Total Earn</p><p className="font-bold mt-0.5">{member.total_earned.toLocaleString("id-ID")}</p></div>
              <div><p className="opacity-70">Total Belanja</p><p className="font-bold mt-0.5 truncate">{formatRupiah(member.total_spent_rupiah)}</p></div>
              <div><p className="opacity-70">Kunjungan</p><p className="font-bold mt-0.5">{member.visit_count}</p></div>
            </div>
          </Card>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {member.phone}</p>
            {member.email && <p className="flex items-center gap-1.5"><MailIcon className="w-3.5 h-3.5" /> {member.email}</p>}
          </div>

          <Card className="p-3.5">
            <h4 className="text-xs font-bold mb-2">Sesuaikan Poin</h4>
            <div className="flex gap-2">
              <Input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="±poin" className="h-9" />
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan" className="h-9" />
              <Button onClick={handleAdjust} disabled={adjust.isPending} className="h-9">Simpan</Button>
            </div>
          </Card>

          <div>
            <h4 className="text-xs font-bold mb-2">Riwayat Poin</h4>
            {txns.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Belum ada riwayat</p>
            ) : (
              <div className="space-y-1.5">
                {txns.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                    <div>
                      <p className="font-semibold capitalize">{t.type}</p>
                      <p className="text-[10px] text-muted-foreground">{t.note} · {new Date(t.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <p className={cn("font-extrabold", t.points >= 0 ? "text-primary" : "text-destructive")}>
                      {t.points >= 0 ? "+" : ""}{t.points}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={handleDelete} className="w-full text-destructive border-destructive/30">
            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Member
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* -------------------- VOUCHERS -------------------- */
const VouchersTab = ({ vouchers }: { vouchers: LoyaltyVoucher[] }) => {
  const [editing, setEditing] = useState<LoyaltyVoucher | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const del = useDeleteVoucher();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus voucher "${name}"?`)) return;
    try {
      await del.mutateAsync(id);
      toast.success("Voucher dihapus");
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpenNew(true)} className="w-full"><Plus className="w-4 h-4 mr-1" />Voucher Baru</Button>

      {vouchers.length === 0 ? (
        <Card className="p-8 text-center">
          <Ticket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-semibold">Belum ada voucher</p>
          <p className="text-xs text-muted-foreground mt-1">Buat voucher yang dapat ditukar dengan poin oleh member.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {vouchers.map((v) => (
            <Card key={v.id} className="p-3.5">
              <div className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", v.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{v.name}</p>
                    {!v.active && <Badge variant="secondary" className="text-[9px] py-0 h-4">Nonaktif</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {v.discount_type === "percent" ? `${v.discount_value}% diskon` : `Diskon ${formatRupiah(v.discount_value)}`}
                    {" · "}{v.points_cost} poin
                    {v.min_purchase > 0 && ` · min ${formatRupiah(v.min_purchase)}`}
                  </p>
                  {v.valid_until && <p className="text-[10px] text-muted-foreground mt-0.5">Berlaku s/d {new Date(v.valid_until).toLocaleDateString("id-ID")}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(v)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(v.id, v.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <VoucherDialog
        open={openNew || !!editing}
        voucher={editing}
        onClose={() => { setOpenNew(false); setEditing(null); }}
      />
    </div>
  );
};

const VoucherDialog = ({ open, voucher, onClose }: { open: boolean; voucher: LoyaltyVoucher | null; onClose: () => void }) => {
  const upsert = useUpsertVoucher();
  const [form, setForm] = useState<Partial<LoyaltyVoucher>>({
    name: "", description: "", discount_type: "fixed", discount_value: 0,
    points_cost: 100, min_purchase: 0, valid_until: null, active: true,
  });

  useEffect(() => {
    if (open) {
      setForm(voucher ?? {
        name: "", description: "", discount_type: "fixed", discount_value: 0,
        points_cost: 100, min_purchase: 0, valid_until: null, active: true,
      });
    }
  }, [open, voucher]);

  const submit = async () => {
    if (!form.name?.trim()) { toast.error("Nama wajib diisi"); return; }
    try {
      await upsert.mutateAsync({ ...form, id: voucher?.id });
      toast.success(voucher ? "Voucher diperbarui" : "Voucher dibuat");
      setForm({});
      onClose();
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setForm({}); onClose(); } }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{voucher ? "Edit Voucher" : "Voucher Baru"}</DialogTitle>
          <DialogDescription>Atur diskon, biaya poin, dan masa berlaku voucher.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Nama *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
          <div><Label>Deskripsi</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={300} rows={2} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tipe</Label>
              <Select value={form.discount_type || "fixed"} onValueChange={(v) => setForm({ ...form, discount_type: v as "percent" | "fixed" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                  <SelectItem value="percent">Persentase (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Nilai Diskon</Label><Input type="number" value={form.discount_value ?? 0} onChange={(e) => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Biaya Poin</Label><Input type="number" value={form.points_cost ?? 0} onChange={(e) => setForm({ ...form, points_cost: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Min Belanja (Rp)</Label><Input type="number" value={form.min_purchase ?? 0} onChange={(e) => setForm({ ...form, min_purchase: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><Label>Berlaku s/d (opsional)</Label><Input type="date" value={form.valid_until || ""} onChange={(e) => setForm({ ...form, valid_until: e.target.value || null })} /></div>
          <div className="flex items-center justify-between">
            <Label>Aktif</Label>
            <Switch checked={form.active ?? true} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setForm({}); onClose(); }}>Batal</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{upsert.isPending ? "Menyimpan..." : "Simpan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* -------------------- SETTINGS -------------------- */
const SettingsTab = () => {
  const { data: settings } = useLoyaltySettings();
  const upsert = useUpsertLoyaltySettings();
  const [form, setForm] = useState<{ enabled: boolean; points_per_rupiah: number; point_value_rupiah: number; min_redeem_points: number; welcome_bonus: number; auto_create_member: boolean; terms: string }>({
    enabled: settings?.enabled ?? false,
    points_per_rupiah: settings?.points_per_rupiah ?? 0.01,
    point_value_rupiah: settings?.point_value_rupiah ?? 100,
    min_redeem_points: settings?.min_redeem_points ?? 100,
    welcome_bonus: settings?.welcome_bonus ?? 0,
    auto_create_member: settings?.auto_create_member ?? true,
    terms: settings?.terms ?? "",
  });

  // sync once on settings load
  const [synced, setSynced] = useState(false);
  if (settings && !synced) {
    setSynced(true);
    setForm({
      enabled: settings.enabled,
      points_per_rupiah: settings.points_per_rupiah,
      point_value_rupiah: settings.point_value_rupiah,
      min_redeem_points: settings.min_redeem_points,
      welcome_bonus: settings.welcome_bonus,
      auto_create_member: settings.auto_create_member,
      terms: settings.terms || "",
    });
  }

  const save = async () => {
    try {
      await upsert.mutateAsync(form);
      toast.success("Pengaturan tersimpan");
    } catch {
      toast.error("Gagal menyimpan");
    }
  };

  const previewPoints = Math.floor(100000 * form.points_per_rupiah);

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Aktifkan Loyalty</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pelanggan mulai mendapat poin dari setiap transaksi.</p>
          </div>
          <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-bold">Konfigurasi Poin</h3>
        <div>
          <Label className="text-xs">Poin per Rupiah</Label>
          <Input type="number" step="0.0001" value={form.points_per_rupiah} onChange={(e) => setForm({ ...form, points_per_rupiah: parseFloat(e.target.value) || 0 })} />
          <p className="text-[10px] text-muted-foreground mt-1">Belanja Rp100.000 = <strong>{previewPoints} poin</strong></p>
        </div>
        <div>
          <Label className="text-xs">Nilai 1 Poin (Rp)</Label>
          <Input type="number" value={form.point_value_rupiah} onChange={(e) => setForm({ ...form, point_value_rupiah: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs">Min Poin untuk Tukar</Label>
          <Input type="number" value={form.min_redeem_points} onChange={(e) => setForm({ ...form, min_redeem_points: parseInt(e.target.value) || 0 })} />
        </div>
        <div>
          <Label className="text-xs">Welcome Bonus (poin)</Label>
          <Input type="number" value={form.welcome_bonus} onChange={(e) => setForm({ ...form, welcome_bonus: parseInt(e.target.value) || 0 })} />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Auto-Daftar Member</p>
            <p className="text-xs text-muted-foreground mt-0.5">Daftarkan otomatis saat no HP baru di kasir.</p>
          </div>
          <Switch checked={form.auto_create_member} onCheckedChange={(v) => setForm({ ...form, auto_create_member: v })} />
        </div>
      </Card>

      <Card className="p-4">
        <Label className="text-xs">Syarat & Ketentuan</Label>
        <Textarea value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} maxLength={1000} rows={4} placeholder="Contoh: Poin berlaku 12 bulan, tidak dapat ditukar uang tunai..." />
      </Card>

      <Card className="p-4 bg-muted/40">
        <p className="text-xs font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Segera Hadir</p>
        <p className="text-[11px] text-muted-foreground mt-1">Broadcast WhatsApp otomatis untuk promo, ulang tahun, dan reminder voucher kadaluarsa.</p>
      </Card>

      <Button onClick={save} disabled={upsert.isPending} className="w-full h-11">{upsert.isPending ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
    </div>
  );
};

export default Loyalty;