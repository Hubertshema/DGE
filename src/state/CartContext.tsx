import React, { createContext, useContext, useState } from 'react';
import { Product, CartItem, ProductVariation } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, selectedVariation?: ProductVariation) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Note: Client subtotal is an interface convenience preview.
  // Prompt rule: The server calculates all authoritative prices and totals during checkout.
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product, quantity: number = 1, selectedVariation?: ProductVariation) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === product.id && i.selectedVariation?.id === selectedVariation?.id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `${product.id}_${selectedVariation?.id || 'default'}_${Date.now()}`,
        productId: product.id,
        product,
        quantity,
        selectedVariation,
      };
      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
