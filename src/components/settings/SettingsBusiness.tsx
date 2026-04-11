import { useState, useEffect } from "react";
import { useAppState } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Banknote, Building2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SettingsBusiness = ({ open, onClose }: Props) => {
  const { businessId, businessName, businessCategory, setBusinessName } = useAppState();
  const [name, setName] = useState(businessName);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !businessId) return;
    setLoading(true);
    supabase
      .from("businesses")
      .select("name, address, phone")
      .eq("id", businessId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setAddress(data.address || "");
          setPhone(data.phone || "");
        }
        setLoading(false);
      });
  }, [open, businessId]);

  if (!open) return null;

  const handleSave = async () => {
    if (!businessId || !name) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ name, address, phone })
        .eq("id", businessId);
      if (error) {
        toast.error(error.message);
        return;
      }
      setBusinessName(name);
      toast.success("Pengaturan bisnis diperbarui!");
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = businessCategory === 'warung'
    ? 'Warung / Kelontong'
    : businessCategory === 'restoran'
    ? 'Restoran / Warung Makan'
    : 'Online Shop / Reseller';

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-foreground/40" onClick={onClose} />
      <div className="bg-card rounded-t-3xl max-w-lg md:max-w-2xl mx-auto w-full animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-lg font-bold">Pengaturan Bisnis</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground">Kategori Bisnis</p>
                <p className="text-sm font-semibold mt-0.5">{categoryLabel}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Nama Bisnis *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Alamat / Lokasi</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Contoh No. 123" className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Nomor HP</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="px-5 py-4 border-t shrink-0">
              <Button variant="cta" className="w-full h-12 text-sm" onClick={handleSave} disabled={!name || saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsBusiness;
