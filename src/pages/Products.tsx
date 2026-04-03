import { useState, useRef } from "react";
import MobileLayout from "@/components/MobileLayout";
import { useAppState } from "@/contexts/AppContext";
import { SAMPLE_PRODUCTS, PRODUCT_CATEGORIES, formatRupiah } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Search, Edit2, X, UtensilsCrossed, Coffee, Cookie, ImagePlus } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";

const Products = () => {
  const { businessCategory } = useAppState();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Makanan", stock: "" });
  const [productImage, setProductImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headerColor = businessCategory === 'restoran'
    ? 'bg-restoran'
    : businessCategory === 'onlineshop'
    ? 'bg-onlineshop'
    : 'bg-primary';

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.price) return;
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: newProduct.name,
        price: parseInt(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
      } : p));
      toast.success("Produk berhasil diperbarui!");
    } else {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: parseInt(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
      };
      setProducts([product, ...products]);
      toast.success("Produk berhasil ditambahkan!");
    }
    setNewProduct({ name: "", price: "", category: "Makanan", stock: "" });
    setProductImage(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setNewProduct({ name: "", price: "", category: "Makanan", stock: "" });
    setProductImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className={cn("px-5 pt-10 pb-4 text-primary-foreground", headerColor)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Produk</h1>
            <p className="text-xs opacity-80">{products.length} produk terdaftar</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
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
              activeCategory === cat ? cn("text-primary-foreground", headerColor) : "bg-muted text-muted-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="px-5 pb-4 space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="bg-card rounded-2xl card-shadow p-4 flex items-center gap-3">
            <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
              {product.category === "Makanan" ? <UtensilsCrossed className="w-6 h-6 text-muted-foreground" /> : product.category === "Minuman" ? <Coffee className="w-6 h-6 text-muted-foreground" /> : <Cookie className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm font-extrabold">{formatRupiah(product.price)}</p>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  product.stock <= (product.minStock || 5)
                    ? "bg-destructive/10 text-destructive"
                    : "bg-success/10 text-success"
                )}>
                  Stok: {product.stock}
                </span>
              </div>
            </div>
            <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Product Sheet */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-foreground/40" onClick={handleCloseForm} />
          <div className="bg-card rounded-t-3xl max-w-lg mx-auto w-full animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-bold">{editingProduct ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={handleCloseForm}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nama Produk *</Label>
                <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nama produk" className="h-11 rounded-xl" />
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
              <Button variant="cta" className="w-full h-12 text-sm" onClick={handleAdd} disabled={!newProduct.name || !newProduct.price}>
                Simpan Produk
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Products;
