import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { useProducts } from "@/hooks/useProducts";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { PRODUCT_CATEGORIES, formatRupiah } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Minus, Plus, ShoppingCart, X, Banknote, Building2, Clock, UtensilsCrossed, Coffee, Cookie, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "Makanan": return <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />;
    case "Minuman": return <Coffee className="w-8 h-8 text-muted-foreground" />;
    case "Snack": return <Cookie className="w-8 h-8 text-muted-foreground" />;
    default: return <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />;
  }
};

const categoryIconSmall = (cat: string) => {
  switch (cat) {
    case "Makanan": return <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />;
    case "Minuman": return <Coffee className="w-5 h-5 text-muted-foreground" />;
    case "Snack": return <Cookie className="w-5 h-5 text-muted-foreground" />;
    default: return <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />;
  }
};

const POS = () => {
  const { businessCategory, cart, addToCart, updateCartQty, removeFromCart, clearCart, cartTotal } = useAppState();
  const { data: products = [], isLoading } = useProducts();
  const createTransaction = useCreateTransaction();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [pendingMethod, setPendingMethod] = useState<string | null>(null);

  const headerColor = 'bg-primary';

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const change = amountPaid ? parseInt(amountPaid) - cartTotal : 0;

  const handleSelectMethod = (method: string) => {
    if (method === "Cash" && (!amountPaid || parseInt(amountPaid) < cartTotal)) {
      toast.error("Nominal bayar kurang dari total!");
      return;
    }
    setPendingMethod(method);
  };

  const handleConfirmCheckout = async () => {
    if (!pendingMethod) return;
    const paymentMap: Record<string, string> = { "Cash": "cash", "Transfer": "transfer", "Bayar Nanti": "bayar_nanti" };
    try {
      await createTransaction.mutateAsync({
        items: cart.map((i) => ({ productId: i.product.id, name: i.product.name, qty: i.quantity, price: i.product.price, subtotal: i.subtotal })),
        total: cartTotal,
        discount: 0,
        payment_method: paymentMap[pendingMethod] || "cash",
      });
      toast.success(`Transaksi ${formatRupiah(cartTotal)} berhasil! (${pendingMethod})`);
      clearCart();
      setShowCart(false);
      setShowCheckout(false);
      setAmountPaid("");
      setPendingMethod(null);
    } catch {
      toast.error("Gagal menyimpan transaksi");
    }
  };

  const handleCancelConfirm = () => setPendingMethod(null);

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold">Kasir</h1>
          <button onClick={() => setShowCart(true)} className="relative w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="pl-10 h-10 rounded-xl bg-primary-foreground/20 border-0 text-primary-foreground placeholder:text-primary-foreground/60" />
        </div>
      </div>

      <div className="px-5 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {PRODUCT_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors", activeCategory === cat ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground")}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="px-5 md:px-8 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <div key={product.id} className="bg-card rounded-2xl card-shadow overflow-hidden">
                <div className="h-28 md:h-32 bg-muted flex items-center justify-center overflow-hidden">
                  {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : categoryIcon(product.category)}
                </div>
                <div className="p-3">
                  <p className="text-xs md:text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs md:text-sm font-extrabold text-foreground">{formatRupiah(product.price)}</p>
                  </div>
                  <div className="mt-2">
                    {inCart ? (
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => updateCartQty(product.id, inCart.quantity - 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                        <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <Button onClick={() => addToCart(product)} variant="outline" className="w-full h-9 text-xs rounded-full border-primary text-primary font-bold">
                        <Plus className="w-3.5 h-3.5 mr-1" />Tambah
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">Belum ada produk</div>
          )}
        </div>
      )}

      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg md:max-w-xl z-40">
          <button onClick={() => setShowCart(true)} className={cn("w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-primary-foreground shadow-lg", headerColor)}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} item</span>
            </div>
            <span className="text-sm font-extrabold">{formatRupiah(cartTotal)}</span>
          </button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40" onClick={() => setShowCart(false)}>
          <div className="bg-card rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up w-full max-w-lg md:max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b shrink-0">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button onClick={() => setShowCart(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 md:px-8 py-3 space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" /> : categoryIconSmall(item.product.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item.product)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-bold w-20 text-right shrink-0">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="border-t px-5 md:px-8 py-4 pb-8 space-y-3 shrink-0">
              <div className="flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-price">{formatRupiah(cartTotal)}</span>
              </div>
              {!showCheckout ? (
                <Button variant="cta" className="w-full h-14 text-base" onClick={() => setShowCheckout(true)}>Bayar Sekarang</Button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <Input type="number" placeholder="Nominal bayar..." value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="h-12 rounded-xl text-lg font-bold text-center" />
                  {amountPaid && parseInt(amountPaid) >= cartTotal && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Kembalian</p>
                      <p className="text-2xl font-extrabold text-primary">{formatRupiah(change)}</p>
                    </div>
                  )}
                  {!pendingMethod ? (
                    <div className={cn("grid gap-2 md:gap-3", businessCategory === 'restoran' ? "grid-cols-2" : "grid-cols-3")}>
                      <Button onClick={() => handleSelectMethod("Cash")} variant="cta" className="h-12 md:h-14 flex flex-col gap-0.5"><Banknote className="w-4 h-4" /><span className="text-[10px] md:text-xs">Cash</span></Button>
                      <Button onClick={() => handleSelectMethod("Transfer")} variant="outline" className="h-12 md:h-14 flex flex-col gap-0.5"><Building2 className="w-4 h-4" /><span className="text-[10px] md:text-xs">Transfer</span></Button>
                      {businessCategory !== 'restoran' && (
                        <Button onClick={() => handleSelectMethod("Bayar Nanti")} variant="outline" className="h-12 md:h-14 flex flex-col gap-0.5"><Clock className="w-4 h-4" /><span className="text-[10px] md:text-xs">Nanti</span></Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="text-center p-3 bg-muted rounded-xl">
                        <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                        <p className="text-sm font-bold mt-0.5">{pendingMethod}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleCancelConfirm} variant="outline" className="h-12 text-sm font-semibold">Batalkan</Button>
                        <Button onClick={handleConfirmCheckout} variant="cta" className="h-12 text-sm font-semibold" disabled={createTransaction.isPending}>
                          {createTransaction.isPending ? "Menyimpan..." : "Konfirmasi"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default POS;
