'use client';

import { CartProvider } from '@/contexts/CartContext';
import { ArtworksProvider } from '@/hooks/useArtworks';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ArtworksProvider>
        {children}
      </ArtworksProvider>
    </CartProvider>
  );
}
