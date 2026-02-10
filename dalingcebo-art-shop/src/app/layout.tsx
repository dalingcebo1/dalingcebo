import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ArtworksProvider } from "@/hooks/useArtworks";
import SupabaseProvider from "@/components/SupabaseProvider";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DALINGCEBO - Contemporary Art Gallery",
  description: "Contemporary art that bridges cultures and speaks to the modern soul. Explore original paintings, mixed media, and digital art by Dalingcebo.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
