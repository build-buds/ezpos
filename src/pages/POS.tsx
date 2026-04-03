import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { SAMPLE_PRODUCTS, PRODUCT_CATEGORIES, formatRupiah } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Minus, Plus, ShoppingCart, X, Banknote, Building2, Clock, UtensilsCrossed, Coffee, Cookie } from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");

  const headerColor = businessCategory === 'restoran'
    ? 'bg-restoran'
    : businessCategory === 'onlineshop'
    ? 'bg-onlineshop'
    : 'bg-primary';

  const filteredProducts = SAMPLE_PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const change = amountPaid ? parseInt(amountPaid) - cartTotal : 0;

  const handleCheckout = (method: string) => {
    if (method === "Cash" && (!amountPaid || parseInt(amountPaid) < cartTotal)) {
      toast.error("Nominal bayar kurang dari total!");
      return;
    }
    toast.success(`Transaksi ${formatRupiah(cartTotal)} berhasil! (${method})`);
    clearCart();
    setShowCart(false);
    setShowCheckout(false);
    setAmountPaid("");
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className={cn("px-5 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Kasir</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="pl-10 h-10 rounded-xl bg-primary-foreground/20 border-0 text-primary-foreground placeholder:text-primary-foreground/60"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeCategory === cat
                ? cn("text-primary-foreground", headerColor)
                : "bg-muted text-muted-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const inCart = cart.find((i) => i.product.id === product.id);
          return (
            <div key={product.id} className="bg-card rounded-2xl card-shadow overflow-hidden">
              <div className="h-28 bg-muted flex items-center justify-center">
                {categoryIcon(product.category)}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-foreground line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs font-extrabold text-foreground">{formatRupiah(product.price)}</p>
                </div>
                <div className="mt-2">
                  {inCart ? (
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => updateCartQty(product.id, inCart.quantity - 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                      <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => addToCart(product)}
                      variant="outline"
                      className="w-full h-9 text-xs rounded-full border-primary text-primary font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart floating bar */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[calc(480px-2.5rem)] z-40">
          <button
            onClick={() => setShowCart(true)}
            className={cn("w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-primary-foreground shadow-lg", headerColor)}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} item</span>
            </div>
            <span className="text-sm font-extrabold">{formatRupiah(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Cart Sheet */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex flex-col">
          <div className="flex-1 bg-foreground/40" onClick={() => setShowCart(false)} />
          <div className="bg-card rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up max-w-lg mx-auto w-full pb-20">
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    {categoryIconSmall(item.product.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item.product)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-bold w-20 text-right shrink-0">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="border-t px-5 py-4 space-y-3 shrink-0">
              <div className="flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-price">{formatRupiah(cartTotal)}</span>
              </div>
              {!showCheckout ? (
                <Button variant="cta" className="w-full h-14 text-base" onClick={() => setShowCheckout(true)}>
                  Bayar Sekarang
                </Button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <Input
                    type="number"
                    placeholder="Nominal bayar..."
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="h-12 rounded-xl text-lg font-bold text-center"
                  />
                  {amountPaid && parseInt(amountPaid) >= cartTotal && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Kembalian</p>
                      <p className="text-2xl font-extrabold text-primary">{formatRupiah(change)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleCheckout("Cash")} variant="cta" className="h-12 flex flex-col gap-0.5">
                      <Banknote className="w-4 h-4" />
                      <span className="text-[10px]">Cash</span>
                    </Button>
                    <Button onClick={() => handleCheckout("Transfer")} variant="outline" className="h-12 flex flex-col gap-0.5">
                      <Building2 className="w-4 h-4" />
                      <span className="text-[10px]">Transfer</span>
                    </Button>
                    <Button onClick={() => handleCheckout("Bayar Nanti")} variant="outline" className="h-12 flex flex-col gap-0.5">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px]">Nanti</span>
                    </Button>
                  </div>
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
