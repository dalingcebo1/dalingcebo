import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ArtworksProvider } from "@/hooks/useArtworks";
import SupabaseProvider from "@/components/SupabaseProvider";
import StructuredData from "@/components/StructuredData";
import Analytics from "@/components/Analytics";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://dalingcebo.art'),
  title: {
    default: 'DALINGCEBO - Contemporary Art Gallery',
    template: '%s | DALINGCEBO'
  },
  description: 'Contemporary art that bridges cultures and speaks to the modern soul. Explore original paintings, mixed media, and digital art by Dalingcebo.',
  keywords: ['contemporary art', 'African art', 'paintings', 'original artwork', 'art gallery', 'Dalingcebo', 'South African artist'],
  authors: [{ name: 'Dalingcebo' }],
  creator: 'Dalingcebo',
  publisher: 'Dalingcebo Art',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: '/',
    title: 'DALINGCEBO - Contemporary Art Gallery',
    description: 'Contemporary art that bridges cultures and speaks to the modern soul.',
    siteName: 'DALINGCEBO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DALINGCEBO Contemporary Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DALINGCEBO - Contemporary Art Gallery',
    description: 'Contemporary art that bridges cultures and speaks to the modern soul.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  
  let session = null
  try {
    const {
      data: { session: fetchedSession },
    } = await supabase.auth.getSession()
    session = fetchedSession
  } catch (err) {
    // Only log error in development to avoid noise
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching session in layout:', err)
    }
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Analytics />
        <StructuredData />
        <SupabaseProvider initialSession={session}>
          <CartProvider>
            <ArtworksProvider>
              {children}
            </ArtworksProvider>
          </CartProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
