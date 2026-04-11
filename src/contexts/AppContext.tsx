import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BusinessCategory, CartItem, Product } from "@/types";

interface User {
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  businessCategory: BusinessCategory | null;
  setBusinessCategory: (cat: BusinessCategory) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const STORAGE_KEY = "ezpos_state";

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadState();

  const [user, setUser] = useState<User | null>(saved?.user ?? null);
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory | null>(saved?.businessCategory ?? null);
  const [businessName, setBusinessName] = useState(saved?.businessName ?? "");
  const [isOnboarded, setIsOnboarded] = useState(saved?.isOnboarded ?? false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, businessCategory, businessName, isOnboarded })
    );
  }, [user, businessCategory, businessName, isOnboarded]);

  const isLoggedIn = !!user;

  const login = (email: string, _password: string) => {
    // Simulasi: cek apakah ada user tersimpan dengan email ini
    const savedState = loadState();
    if (savedState?.user?.email === email) {
      setUser(savedState.user);
      return true;
    }
    // Untuk simulasi, terima semua login
    setUser({ name: email.split("@")[0], email });
    return true;
  };

  const register = (name: string, email: string, _password: string) => {
    setUser({ name, email });
  };

  const logout = () => {
    setUser(null);
    setIsOnboarded(false);
    setBusinessCategory(null);
    setBusinessName("");
    localStorage.removeItem(STORAGE_KEY);
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
        user, isLoggedIn, login, register, logout,
        businessCategory, setBusinessCategory,
        businessName, setBusinessName,
        isOnboarded, setIsOnboarded,
        cart, addToCart, removeFromCart, updateCartQty, clearCart, cartTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
