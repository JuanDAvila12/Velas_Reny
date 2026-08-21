"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "velasreni_cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Evita escribir en localStorage antes de hidratar el estado inicial.
  const [hydrated, setHydrated] = useState(false);

  // Cargar el carrito desde localStorage solo en el cliente.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (i) =>
                i &&
                typeof i.quantity === "number" &&
                i.product &&
                typeof i.product.id === "number"
            )
          );
        }
      }
    } catch {
      // Ignorar datos corruptos y empezar con carrito vacío.
    }
    setHydrated(true);
  }, []);

  // Persistir tras cada cambio (solo después de la hidratación inicial).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignorar errores (cuota excedida, modo privado, etc.).
    }
  }, [items, hydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const qty = Math.max(1, Math.floor(quantity));
      const maxStock =
        product.stock != null && product.stock > 0 ? product.stock : 1;

      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, maxStock) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(qty, maxStock) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const maxStock =
          i.product.stock != null && i.product.stock > 0 ? i.product.stock : 1;
        const qty = Math.max(1, Math.min(Math.floor(quantity), maxStock));
        return { ...i, quantity: qty };
      })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce(
      (sum, i) => sum + (i.product.price ?? 0) * i.quantity,
      0
    );
    return {
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    };
  }, [items, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return ctx;
}
