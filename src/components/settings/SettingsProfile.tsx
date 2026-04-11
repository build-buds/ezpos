import { useState } from "react";
import { useAppState } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SettingsSheet from "./SettingsSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SettingsProfile = ({ open, onClose }: Props) => {
  const { user } = useAppState();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

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
      if (error) { toast.error(error.message); return; }
      toast.success("Profil berhasil diperbarui!");
      setNewPassword("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSheet
      open={open}
      onClose={onClose}
      title="Profil Akun"
      footer={
        <Button variant="cta" className="w-full h-12 text-sm" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</> : "Simpan Perubahan"}
        </Button>
      }
    >
      <div className="space-y-5">
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
    </SettingsSheet>
  );
};

export default SettingsProfile;
