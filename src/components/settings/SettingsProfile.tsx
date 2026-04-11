import { useState } from "react";
import { useAppState } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SettingsProfile = ({ open, onClose }: Props) => {
  const { user } = useAppState();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (fullName !== (user?.user_metadata?.full_name || "")) {
        updates.data = { full_name: fullName };
      }
      if (newPassword.length >= 6) {
        updates.password = newPassword;
      }
      if (Object.keys(updates).length === 0) {
        toast.info("Tidak ada perubahan");
        return;
      }
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Profil berhasil diperbarui!");
      setNewPassword("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-foreground/40" onClick={onClose} />
      <div className="bg-card rounded-t-3xl max-w-lg md:max-w-2xl mx-auto w-full animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-lg font-bold">Profil Akun</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Nama Lengkap</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap" className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Email</Label>
            <Input value={user?.email || ""} disabled className="h-11 rounded-xl bg-muted" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Ganti Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru (min 6 karakter)" className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="px-5 py-4 border-t shrink-0">
          <Button variant="cta" className="w-full h-12 text-sm" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;
