'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Artwork } from '@/types/database'

interface CartItem {
  artwork: Artwork
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (artwork: Artwork) => void
  removeFromCart: (artworkId: string) => void
  updateQuantity: (artworkId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (artwork: Artwork) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.artwork.id === artwork.id)
      if (existingItem) {
        return prevItems.map((item) =>
          item.artwork.id === artwork.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevItems, { artwork, quantity: 1 }]
    })
  }

  const removeFromCart = (artworkId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.artwork.id !== artworkId))
  }

  const updateQuantity = (artworkId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(artworkId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.artwork.id === artworkId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.artwork.price || 0) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
