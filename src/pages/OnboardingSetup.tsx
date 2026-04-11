import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Banknote, Building2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const OnboardingSetup = () => {
  const navigate = useNavigate();
  const { businessCategory, setBusinessName, setIsOnboarded } = useAppState();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentCash, setPaymentCash] = useState(true);
  const [paymentTransfer, setPaymentTransfer] = useState(false);
  const [paymentBayarNanti, setPaymentBayarNanti] = useState(false);

  if (!businessCategory) {
    navigate("/");
    return null;
  }

  const headerColor = 'bg-primary';

  const categoryLabel = businessCategory === 'warung'
    ? 'Warung / Kelontong'
    : businessCategory === 'restoran'
    ? 'Restoran / Warung Makan'
    : 'Online Shop / Reseller';

  const nameLabel = businessCategory === 'warung'
    ? 'Nama Warung'
    : businessCategory === 'restoran'
    ? 'Nama Restoran'
    : 'Nama Toko';

  const handleSubmit = () => {
    if (!name || !phone) return;
    setBusinessName(name);
    setIsOnboarded(true);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen max-w-lg md:max-w-2xl mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className={cn("px-6 md:px-10 pt-10 pb-6 text-primary-foreground", headerColor)}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm opacity-80 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <p className="text-sm opacity-80">Setup Bisnis</p>
        <h1 className="text-xl font-bold mt-1">{categoryLabel}</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 md:px-10 py-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">{nameLabel} *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Masukkan ${nameLabel.toLowerCase()}`} className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold">Alamat / Lokasi *</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Contoh No. 123" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">Nomor HP *</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="h-12 rounded-xl" />
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Metode Bayar Aktif</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-xl card-shadow">
              <span className="text-sm font-medium flex items-center gap-2"><Banknote className="w-4 h-4 text-muted-foreground" /> Cash</span>
              <Switch checked={paymentCash} onCheckedChange={setPaymentCash} />
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-xl card-shadow">
              <span className="text-sm font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> Transfer</span>
              <Switch checked={paymentTransfer} onCheckedChange={setPaymentTransfer} />
            </div>
            {businessCategory !== 'onlineshop' && (
              <div className="flex items-center justify-between p-3 bg-card rounded-xl card-shadow">
                <span className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Bayar Nanti (Hutang)</span>
                <Switch checked={paymentBayarNanti} onCheckedChange={setPaymentBayarNanti} />
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!name || !phone}
          variant="cta"
          className="w-full h-14 text-base mt-6"
        >
          Mulai Gunakan EZPOS
        </Button>
      </div>
    </div>
  );
};

export default OnboardingSetup;
