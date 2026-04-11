import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BusinessCategory, CartItem, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupaUser } from "@supabase/supabase-js";

interface AppState {
  user: SupaUser | null;
  session: Session | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  businessId: string | null;
  businessCategory: BusinessCategory | null;
  setBusinessCategory: (cat: BusinessCategory) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  setBusinessId: (id: string) => void;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessCategory, setBusinessCategoryState] = useState<BusinessCategory | null>(() => {
    const saved = localStorage.getItem('ezpos_business_category');
    return saved ? (saved as BusinessCategory) : null;
  });

  const setBusinessCategory = (cat: BusinessCategory | null) => {
    setBusinessCategoryState(cat);
    if (cat) {
      localStorage.setItem('ezpos_business_category', cat);
    } else {
      localStorage.removeItem('ezpos_business_category');
    }
  };
  const [businessName, setBusinessName] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadBusinessData = async (userId: string) => {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, name, category")
      .eq("owner_id", userId)
      .limit(1);

    if (businesses && businesses.length > 0) {
      const biz = businesses[0];
      setBusinessId(biz.id);
      setBusinessName(biz.name);
      setBusinessCategory(biz.category as BusinessCategory);
      setIsOnboarded(true);
    } else {
      setIsOnboarded(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Restore session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadBusinessData(session.user.id);
      }

      if (mounted) setIsAuthLoading(false);
    });

    // Handle subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Fire-and-forget to avoid blocking
          loadBusinessData(newSession.user.id);
        } else {
          setBusinessId(null);
          setBusinessName("");
          setBusinessCategory(null);
          setIsOnboarded(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = !!user;

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsOnboarded(false);
    setBusinessCategory(null);
    setBusinessName("");
    setBusinessId(null);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.product.price }
            : i
        );
      }
      return [...prev, { product, quantity: 1, subtotal: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: qty, subtotal: qty * i.product.price }
          : i
      )
    );
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, i) => sum + i.subtotal, 0);

  return (
    <AppContext.Provider
      value={{
        user, session, isLoggedIn, isAuthLoading,
        businessId, setBusinessId,
        businessCategory, setBusinessCategory,
        businessName, setBusinessName,
        isOnboarded, setIsOnboarded,
        logout,
        cart, addToCart, removeFromCart, updateCartQty, clearCart, cartTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
