'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../types';

interface CartItem {
  artworkId: string;
  title: string;
  price: number;
  image: string;
  quantity: number; // strictly 1 for unique artworks
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (artwork: Artwork) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isInCart: (artworkId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('oma_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('oma_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart, isLoaded]);

  const addToCart = (artwork: Artwork) => {
    // Unique artwork check: limit quantity to 1
    setCart((prev) => {
      const exists = prev.some((item) => item.artworkId === artwork.id);
      if (exists) return prev; // already in cart
      
      const newItem: CartItem = {
        artworkId: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image: artwork.images && artwork.images[0] ? artwork.images[0] : '/images/artist-studio.png',
        quantity: 1, // capped at 1 for 1-of-1 artworks
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (artworkId: string) => {
    setCart((prev) => prev.filter((item) => item.artworkId !== artworkId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (artworkId: string) => {
    return cart.some((item) => item.artworkId === artworkId);
  };

  const cartCount = cart.length;
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
