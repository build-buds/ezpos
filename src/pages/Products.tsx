import { useState, useRef } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { useProducts, useAddProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useIsPro } from "@/hooks/useSubscription";
import { PRODUCT_CATEGORIES, formatRupiah } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Search, Edit2, X, UtensilsCrossed, Coffee, Cookie, ImagePlus, Loader2, Lock } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const FREE_PRODUCT_LIMIT = 50;

const Products = () => {
  const { businessId } = useAppState();
  const { data: products = [], isLoading } = useProducts();
  const isPro = useIsPro();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Makanan", stock: "" });
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headerColor = 'bg-primary';

  const isAtProductLimit = !isPro && products.length >= FREE_PRODUCT_LIMIT;

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${businessId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Gagal upload gambar"); return null; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    return publicUrl;
  };

  const handleOpenAddForm = () => {
    if (isAtProductLimit) {
      toast.error(`Batas ${FREE_PRODUCT_LIMIT} produk tercapai. Upgrade ke Pro untuk unlimited produk.`);
      return;
    }
    setShowAddForm(true);
  };

  const handleAdd = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    try {
      let image_url: string | undefined;
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) image_url = url;
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          name: newProduct.name,
          price: parseInt(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 0,
          ...(image_url ? { image_url } : {}),
        });
        toast.success("Produk berhasil diperbarui!");
      } else {
        await addProduct.mutateAsync({
          name: newProduct.name,
          price: parseInt(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock) || 0,
          ...(image_url ? { image_url } : {}),
        });
        toast.success("Produk berhasil ditambahkan!");
      }
      handleCloseForm();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    if (product.image) setProductImage(product.image);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setNewProduct({ name: "", price: "", category: "Makanan", stock: "" });
    setProductImage(null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <MobileLayout>
      <div className={cn("px-5 md:px-8 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold">Produk</h1>
            <p className="text-xs opacity-80">
              {products.length}{!isPro ? `/${FREE_PRODUCT_LIMIT}` : ""} produk terdaftar
            </p>
          </div>
          <button onClick={handleOpenAddForm} className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            {isAtProductLimit ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="pl-10 h-10 rounded-xl bg-primary-foreground/20 border-0 text-primary-foreground placeholder:text-primary-foreground/60" />
        </div>
      </div>

      {!isPro && (
        <div className="px-5 md:px-8 pt-3">
          <button
            onClick={() => navigate("/pricing")}
            className="w-full flex items-center justify-between p-3 bg-primary/10 rounded-xl text-xs"
          >
            <span className="text-muted-foreground">
              Paket Gratis: <strong>{products.length}/{FREE_PRODUCT_LIMIT}</strong> produk
            </span>
            <span className="text-primary font-bold">Upgrade →</span>
          </button>
        </div>
      )}

      <div className="px-5 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {PRODUCT_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors", activeCategory === cat ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground")}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="px-5 md:px-8 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((product) => (
            <div key={product.id} className="bg-card rounded-2xl card-shadow p-4 flex items-center gap-3">
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : product.category === "Makanan" ? <UtensilsCrossed className="w-6 h-6 text-muted-foreground" /> : product.category === "Minuman" ? <Coffee className="w-6 h-6 text-muted-foreground" /> : <Cookie className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm font-extrabold">{formatRupiah(product.price)}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", product.stock <= (product.minStock || 5) ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>
                    Stok: {product.stock}
                  </span>
                </div>
              </div>
              <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              Belum ada produk. Tap + untuk menambah produk pertamamu.
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex flex-col">
          <div className="flex-1 bg-foreground/40" onClick={handleCloseForm} />
          <div className="bg-card rounded-t-3xl max-w-lg md:max-w-2xl mx-auto w-full animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
              <h2 className="text-lg font-bold">{editingProduct ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={handleCloseForm}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Gambar Produk</Label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-28 rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors">
                  {productImage ? (
                    <img src={productImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Tap untuk upload gambar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nama Produk *</Label>
                <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nama produk" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Kategori *</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRODUCT_CATEGORIES.filter(c => c !== "Semua").map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, category: cat })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-semibold transition-colors border",
                        newProduct.category === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Harga Jual *</Label>
                  <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Stok Awal</Label>
                  <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 pb-6 border-t shrink-0">
              <Button variant="cta" className="w-full h-12 text-sm" onClick={handleAdd} disabled={!newProduct.name || !newProduct.price || saving}>
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Products;
