import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Award, X, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { findMemberByPhone, useCreateMember, useLoyaltySettings, type LoyaltyMember } from "@/hooks/useLoyalty";
import { useAppState } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const tierStyles: Record<string, string> = {
  bronze: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  silver: "bg-slate-400/15 text-slate-700 border-slate-400/30",
  gold: "bg-yellow-400/15 text-yellow-700 border-yellow-500/40",
};

interface Props {
  member: LoyaltyMember | null;
  onSelect: (m: LoyaltyMember | null) => void;
}

export const POSLoyaltyPanel = ({ member, onSelect }: Props) => {
  const { businessId } = useAppState();
  const { data: settings } = useLoyaltySettings();
  const create = useCreateMember();
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");

  if (!settings?.enabled) return null;

  const handleSearch = async () => {
    if (!businessId || !phone.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const found = await findMemberByPhone(businessId, phone.trim());
      if (found) {
        onSelect(found);
        setPhone("");
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error("Gagal mencari member");
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Nama wajib diisi"); return; }
    try {
      const m = await create.mutateAsync({ name: name.trim(), phone: phone.trim() });
      onSelect(m);
      setName(""); setPhone(""); setNotFound(false);
      toast.success("Member baru ditambahkan");
    } catch {
      toast.error("Gagal menambahkan member");
    }
  };

  if (member) {
    return (
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold truncate">{member.name}</p>
              <Badge variant="outline" className={cn("text-[9px] py-0 h-4 capitalize", tierStyles[member.tier])}>{member.tier}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{member.phone} · <strong className="text-primary">{member.points_balance.toLocaleString("id-ID")} poin</strong></p>
          </div>
          <button onClick={() => onSelect(null)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground">Member (opsional)</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={phone} onChange={(e) => { setPhone(e.target.value); setNotFound(false); }} placeholder="No HP member" className="h-9 pl-8 text-sm" />
        </div>
        <Button onClick={handleSearch} disabled={searching || !phone.trim()} variant="outline" className="h-9 px-3">
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Cari"}
        </Button>
      </div>
      {notFound && (
        <div className="p-2.5 rounded-lg bg-muted/60 space-y-2 animate-fade-in">
          <p className="text-[11px] text-muted-foreground">Member belum terdaftar. Daftarkan baru?</p>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pelanggan" className="h-8 text-sm" />
            <Button onClick={handleCreate} disabled={create.isPending} className="h-8 px-3">
              <UserPlus className="w-3.5 h-3.5 mr-1" />Daftar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};