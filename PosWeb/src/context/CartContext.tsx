import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, TransactionDto } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItemsCount: number;
  offlineQueue: TransactionDto[];
  addOfflineTransaction: (tx: TransactionDto) => void;
  clearOfflineQueue: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [offlineQueue, setOfflineQueue] = useState<TransactionDto[]>(() => {
    const saved = localStorage.getItem('pos_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pos_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  const addOfflineTransaction = (tx: TransactionDto) => {
    setOfflineQueue((prev) => [tx, ...prev]);
  };

  const clearOfflineQueue = () => setOfflineQueue([]);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItemsCount,
        offlineQueue,
        addOfflineTransaction,
        clearOfflineQueue,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
