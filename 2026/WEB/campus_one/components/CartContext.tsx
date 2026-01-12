"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Product = {
  name: string;
  price: string;
};

type CartContextType = {
  items: Product[];
  addToCart: (product: Product) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addToCart = (product: Product) => {
    setItems((prev) => [...prev, product]);
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, clearCart, cartCount: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
