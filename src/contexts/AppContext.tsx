import { createContext, useContext, useState, ReactNode } from "react";
import { BusinessCategory, CartItem, Product } from "@/types";

interface AppState {
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

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

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
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
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
