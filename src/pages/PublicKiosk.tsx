import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ShoppingBag, UtensilsCrossed, ArrowLeft, Plus, Minus, Check, Banknote, QrCode, Trash2, Coffee, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePublicKioskSettings,
  usePublicKioskProducts,
  startKioskSession,
  completeKioskSession,
  createPublicTransaction,
} from "@/hooks/useKiosk";
import { Numpad } from "@/components/kiosk/Numpad";
import { formatRupiah } from "@/data/products";
import { toast } from "sonner";

type Step = "welcome" | "type" | "menu" | "cart" | "pay" | "success";
type OrderType = "kiosk-dinein" | "kiosk-takeaway";

interface KItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string | null;
  category?: string;
}

const categoryIcon = (cat?: string) => {
  switch (cat) {
    case "Minuman": return <Coffee className="w-12 h-12 text-muted-foreground" />;
    case "Snack": return <Cookie className="w-12 h-12 text-muted-foreground" />;
    default: return <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />;
  }
};

const PublicKiosk = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePublicKioskSettings(slug);
  const settings = data?.settings;
  const business = data?.business;
  const { data: products = [] } = usePublicKioskProducts(business?.id);

  const [step, setStep] = useState<Step>("welcome");
  const [orderType, setOrderType] = useState<OrderType>("kiosk-dinein");
  const [cart, setCart] = useState<KItem[]>([]);
  const [activeCat, setActiveCat] = useState("Semua");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashInput, setCashInput] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const idleRef = useRef<number | null>(null);

  const accent = settings?.accent_color || "#2563EB";
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const categories = useMemo(() => {
    const set = new Set<string>(["Semua"]);
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filtered = activeCat === "Semua" ? products : products.filter((p) => p.category === activeCat);

  /* idle reset */
  const resetIdle = () => {
    if (idleRef.current) window.clearTimeout(idleRef.current);
    if (step === "welcome" || !settings) return;
    idleRef.current = window.setTimeout(() => {
      goHome();
    }, (settings.idle_timeout_seconds || 60) * 1000) as unknown as number;
  };

  useEffect(() => {
    resetIdle();
    return () => {
      if (idleRef.current) window.clearTimeout(idleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goHome = () => {
    setStep("welcome");
    setCart([]);
    setOrderType("kiosk-dinein");
    setPaymentMethod(null);
    setCashInput("");
    setOrderId("");
    sessionIdRef.current = null;
  };

  const start = async () => {
    if (business) {
      sessionIdRef.current = await startKioskSession(business.id);
    }
    setStep(settings?.ask_order_type ? "type" : "menu");
  };

  const addItem = (p: typeof products[number]) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1, image_url: p.image_url, category: p.category }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c.flatMap((i) => {
        if (i.id !== id) return [i];
        const next = i.qty + delta;
        return next <= 0 ? [] : [{ ...i, qty: next }];
      })
    );
  };

  const submitPayment = async () => {
    if (!business || !paymentMethod) return;
    if (paymentMethod === "cash" && parseInt(cashInput || "0") < total) {
      toast.error("Nominal kurang dari total");
      return;
    }
    setSubmitting(true);
    try {
      const txId = await createPublicTransaction({
        business_id: business.id,
        total,
        items: cart.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty })),
        payment_method: paymentMethod,
        order_type: orderType,
      });
      if (sessionIdRef.current) {
        await completeKioskSession(sessionIdRef.current, {
          transaction_id: txId,
          order_type: orderType,
          total,
        });
      }
      setOrderId(txId.slice(-4).toUpperCase());
      setStep("success");
      window.setTimeout(goHome, 8000);
    } catch (e) {
      toast.error((e as Error).message || "Gagal memproses pembayaran");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-md">
          <Monitor />
          <h1 className="text-2xl font-bold mb-2">Kiosk Tidak Tersedia</h1>
          <p className="text-muted-foreground">
            Mode kiosk untuk bisnis ini sedang nonaktif. Silakan hubungi staf.
          </p>
        </div>
      </div>
    );
  }

  const headerStyle = { backgroundColor: accent };
  const accentBtnStyle = { backgroundColor: accent, color: "#ffffff" };

  return (
    <div className="min-h-screen bg-background flex flex-col" onClick={resetIdle} onTouchStart={resetIdle}>
      {/* Welcome */}
      {step === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={headerStyle}>
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">{settings.welcome_title}</h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">{settings.welcome_subtitle}</p>
          <Button onClick={start} className="h-20 px-12 text-2xl rounded-2xl font-bold" style={accentBtnStyle}>
            Mulai Pesan
          </Button>
          <p className="text-xs text-muted-foreground mt-12">{business?.name}</p>
        </div>
      )}

      {/* Order type */}
      {step === "type" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-3xl font-bold mb-8">Pilih Tipe Pesanan</h2>
          <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
            <button
              onClick={() => { setOrderType("kiosk-dinein"); setStep("menu"); }}
              className="p-10 rounded-3xl border-2 hover:scale-105 transition-transform bg-card"
              style={{ borderColor: accent }}
            >
              <UtensilsCrossed className="w-20 h-20 mx-auto mb-4" style={{ color: accent }} />
              <p className="text-2xl font-bold">Makan di Tempat</p>
            </button>
            <button
              onClick={() => { setOrderType("kiosk-takeaway"); setStep("menu"); }}
              className="p-10 rounded-3xl border-2 hover:scale-105 transition-transform bg-card"
              style={{ borderColor: accent }}
            >
              <ShoppingBag className="w-20 h-20 mx-auto mb-4" style={{ color: accent }} />
              <p className="text-2xl font-bold">Bawa Pulang</p>
            </button>
          </div>
          <Button variant="ghost" onClick={goHome} className="mt-8 h-14 text-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />Batal
          </Button>
        </div>
      )}

      {/* Menu */}
      {step === "menu" && (
        <div className="flex-1 flex flex-col">
          <div className="p-6 text-white" style={headerStyle}>
            <div className="flex items-center justify-between">
              <button onClick={goHome} className="flex items-center gap-2 text-lg font-semibold">
                <ArrowLeft className="w-5 h-5" />Kembali
              </button>
              <p className="text-lg font-bold">
                {orderType === "kiosk-dinein" ? "Makan di Tempat" : "Bawa Pulang"}
              </p>
            </div>
          </div>

          <div className="px-6 py-3 flex gap-2 overflow-x-auto bg-card border-b">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className="px-5 py-2 rounded-full text-base font-semibold whitespace-nowrap"
                style={activeCat === cat ? accentBtnStyle : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-32">
            {filtered.map((p) => {
              const inCart = cart.find((i) => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="bg-card rounded-2xl card-shadow overflow-hidden text-left active:scale-95 transition-transform"
                >
                  <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : categoryIcon(p.category)}
                  </div>
                  <div className="p-4">
                    <p className="text-base font-bold line-clamp-1">{p.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{p.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-base font-extrabold">{formatRupiah(p.price)}</p>
                      {inCart && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={headerStyle}>
                          {inCart.qty}x
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">Belum ada produk</p>
            )}
          </div>

          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-2xl">
              <Button
                onClick={() => setStep("cart")}
                className="w-full h-16 text-xl rounded-2xl font-bold"
                style={accentBtnStyle}
              >
                Lihat Pesanan ({cart.reduce((s, i) => s + i.qty, 0)} item) · {formatRupiah(total)}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cart */}
      {step === "cart" && (
        <div className="flex-1 flex flex-col">
          <div className="p-6 text-white" style={headerStyle}>
            <div className="flex items-center justify-between">
              <button onClick={() => setStep("menu")} className="flex items-center gap-2 text-lg font-semibold">
                <ArrowLeft className="w-5 h-5" />Tambah Lagi
              </button>
              <p className="text-lg font-bold">Pesanan Anda</p>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-3 pb-32">
            {cart.map((i) => (
              <div key={i.id} className="bg-card rounded-2xl p-4 flex items-center gap-4 card-shadow">
                <div className="flex-1">
                  <p className="text-lg font-bold">{i.name}</p>
                  <p className="text-sm text-muted-foreground">{formatRupiah(i.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="outline" className="w-12 h-12 rounded-full" onClick={() => updateQty(i.id, -1)}>
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="text-2xl font-bold w-8 text-center">{i.qty}</span>
                  <Button size="icon" variant="outline" className="w-12 h-12 rounded-full" onClick={() => updateQty(i.id, +1)}>
                    <Plus className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="w-12 h-12" onClick={() => updateQty(i.id, -i.qty)}>
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
            <Button
              onClick={() => setStep("pay")}
              className="w-full h-16 text-xl rounded-2xl font-bold"
              style={accentBtnStyle}
              disabled={cart.length === 0}
            >
              Lanjut Bayar
            </Button>
          </div>
        </div>
      )}

      {/* Payment */}
      {step === "pay" && (
        <div className="flex-1 flex flex-col">
          <div className="p-6 text-white" style={headerStyle}>
            <div className="flex items-center justify-between">
              <button onClick={() => { setPaymentMethod(null); setStep("cart"); }} className="flex items-center gap-2 text-lg font-semibold">
                <ArrowLeft className="w-5 h-5" />Kembali
              </button>
              <p className="text-lg font-bold">Pembayaran</p>
            </div>
          </div>
          <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
            <div className="bg-card rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Total Bayar</p>
              <p className="text-4xl font-extrabold mt-1">{formatRupiah(total)}</p>
            </div>

            {!paymentMethod && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(settings.payment_methods || []).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className="p-8 rounded-3xl border-2 bg-card hover:scale-105 transition-transform"
                    style={{ borderColor: accent }}
                  >
                    {m === "cash" && <Banknote className="w-16 h-16 mx-auto mb-3" style={{ color: accent }} />}
                    {m === "qris" && <QrCode className="w-16 h-16 mx-auto mb-3" style={{ color: accent }} />}
                    {m === "transfer" && <Banknote className="w-16 h-16 mx-auto mb-3" style={{ color: accent }} />}
                    <p className="text-2xl font-bold capitalize">{m === "cash" ? "Tunai" : m.toUpperCase()}</p>
                  </button>
                ))}
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">Nominal Bayar</p>
                  <p className="text-3xl font-extrabold mt-1">
                    {cashInput ? formatRupiah(parseInt(cashInput)) : "Rp 0"}
                  </p>
                  {cashInput && parseInt(cashInput) >= total && (
                    <p className="text-sm text-green-600 mt-2">
                      Kembalian: {formatRupiah(parseInt(cashInput) - total)}
                    </p>
                  )}
                </div>
                <Numpad value={cashInput} onChange={setCashInput} accentColor={accent} />
                <Button
                  onClick={submitPayment}
                  disabled={submitting || parseInt(cashInput || "0") < total}
                  className="w-full h-16 text-xl rounded-2xl font-bold"
                  style={accentBtnStyle}
                >
                  {submitting ? "Memproses..." : "Konfirmasi Bayar"}
                </Button>
              </div>
            )}

            {paymentMethod === "qris" && (
              <div className="space-y-4 text-center">
                <div className="bg-card rounded-2xl p-8">
                  <div className="w-56 h-56 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Pindai QR di atas dengan aplikasi mobile banking atau e-wallet Anda.
                  </p>
                </div>
                <Button
                  onClick={submitPayment}
                  disabled={submitting}
                  className="w-full h-16 text-xl rounded-2xl font-bold"
                  style={accentBtnStyle}
                >
                  {submitting ? "Memproses..." : "Konfirmasi Pembayaran Diterima"}
                </Button>
              </div>
            )}

            {paymentMethod === "transfer" && (
              <div className="space-y-4 text-center">
                <div className="bg-card rounded-2xl p-8">
                  <p className="text-base">Silakan transfer ke rekening yang ditampilkan kasir.</p>
                </div>
                <Button
                  onClick={submitPayment}
                  disabled={submitting}
                  className="w-full h-16 text-xl rounded-2xl font-bold"
                  style={accentBtnStyle}
                >
                  {submitting ? "Memproses..." : "Konfirmasi Transfer Diterima"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
          <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 animate-in zoom-in" style={headerStyle}>
            <Check className="w-16 h-16 text-white" />
          </div>
          <p className="text-xl text-muted-foreground mb-2">Nomor Pesanan Anda</p>
          <p className="text-7xl font-extrabold mb-6" style={{ color: accent }}>#{orderId}</p>
          <p className="text-2xl font-bold mb-2">{settings.success_message}</p>
          <p className="text-sm text-muted-foreground mt-8">Akan kembali ke layar utama dalam beberapa detik...</p>
          <Button onClick={goHome} variant="outline" className="mt-6 h-14 px-8 text-lg">
            Pesan Lagi
          </Button>
        </div>
      )}
    </div>
  );
};

const Monitor = () => (
  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
  </div>
);

export default PublicKiosk;