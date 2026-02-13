'use client'

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function NotFound() {
  const [zoomLevel, setZoomLevel] = useState(0);

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} showBackButton />
      <div className="yeezy-hero" style={{ height: '60vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow">
            <div className="mb-4">
              <span className="px-4 py-2 bg-gray-100 text-gray-700 text-xs uppercase tracking-[0.3em] border border-gray-200 inline-block">
                404
              </span>
            </div>
            <h1 className="yeezy-heading text-2xl md:text-3xl mb-6">
              Artwork Not Found
            </h1>
            <p className="yeezy-body text-gray-600 mb-8">
              The artwork you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link 
                href="/shop" 
                className="btn-yeezy-primary px-8 py-3"
              >
                Browse Shop
              </Link>
              <Link 
                href="/" 
                className="btn-yeezy px-8 py-3"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
