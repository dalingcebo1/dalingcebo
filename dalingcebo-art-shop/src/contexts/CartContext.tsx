'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  title: string;
  artist: string;
  price: number; // Final price including variant adjustments
  image: string;
  quantity: number;
  variantSelections?: {
    frameVariantId?: string;
    canvasVariantId?: string;
    frameVariantName?: string;
    canvasVariantName?: string;
  };
  variantPriceAdjustment?: number;
  processingDays?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, maxQuantity?: number) => boolean;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  maxProcessingDays: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, maxQuantity?: number) => {
    let added = false;
    setItems(currentItems => {
      // Check for exact match including variants
      const existingItem = currentItems.find(i => {
        if (i.id !== item.id) return false;
        
        // Check if variant selections match
        const isSameVariants = 
          i.variantSelections?.frameVariantId === item.variantSelections?.frameVariantId &&
          i.variantSelections?.canvasVariantId === item.variantSelections?.canvasVariantId;
        
        return isSameVariants;
      });

      if (existingItem) {
        // Check if we can add more based on maxQuantity
        if (maxQuantity !== undefined && existingItem.quantity >= maxQuantity) {
          added = false;
          return currentItems; // Don't add if we've reached max quantity
        }
        added = true;
        return currentItems.map(i =>
          i === existingItem ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      
      // For new items, check if maxQuantity allows at least 1
      if (maxQuantity !== undefined && maxQuantity < 1) {
        added = false;
        return currentItems;
      }
      
      added = true;
      return [...currentItems, { ...item, quantity: 1 }];
    });
    return added;
  };

  const removeFromCart = (id: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate maximum processing days across all items
  const maxProcessingDays = items.reduce((max, item) => {
    const days = item.processingDays || 7; // Default 7 days if not specified
    return Math.max(max, days);
  }, 7);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        maxProcessingDays,
      }}
    >
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
