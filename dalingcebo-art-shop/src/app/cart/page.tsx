'use client';

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import CheckoutModal from '@/components/CheckoutModal';
import Breadcrumb from '@/components/Breadcrumb';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    setToastMessage('Request received — watch your inbox for the invoice.');
    setShowToast(true);
  };

  const handleClearCart = () => {
    clearCart();
    setToastMessage('Cart cleared');
    setShowToast(true);
  };

  const emptyState = (
    <>
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        </div>
      </section>

      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <h1 className="yeezy-main-logo text-white mb-8">
            CART
          </h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            Your shopping cart is currently empty.
          </p>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container max-w-2xl">
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">YOUR CART IS EMPTY</h2>
            <p className="yeezy-body text-base text-gray-700 mb-8">Add some artwork to begin your collection.</p>
            <Link
              href="/"
              className="btn-yeezy"
            >
              Browse Artwork
            </Link>
          </div>
        </div>
      </section>
    </>
  );

  const cartContent = (
    <>
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        </div>
      </section>

      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <h1 className="yeezy-main-logo text-white mb-8">
            CART
          </h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            {items.length} {items.length === 1 ? 'item' : 'items'} ready for checkout.
          </p>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container max-w-6xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
              <div>
                <h2 className="yeezy-subheading text-sm mb-2 tracking-[0.3em] text-gray-600">SHOPPING CART</h2>
                <p className="yeezy-body text-base text-gray-700">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
              <button
                onClick={handleClearCart}
                className="text-xs uppercase tracking-[0.1em] text-red-600 hover:text-red-800 transition-colors"
              >
                Clear Cart
              </button>
            </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  <Link href={`/artwork/${item.id}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <Link
                          href={`/artwork/${item.id}`}
                          className="text-xl font-light tracking-tight hover:underline mb-1 block truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">{item.artist}</p>
                      </div>
                      <p className="text-xl font-light whitespace-nowrap">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500 mb-3">
                        ${item.price.toLocaleString()} each
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          setToastMessage('Item removed from cart');
                          setShowToast(true);
                        }}
                        className="text-xs uppercase tracking-[0.1em] text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6 pb-4 border-b border-gray-200">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-baseline pt-4">
                  <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Total</span>
                  <span className="text-2xl font-light">${total.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full btn-yeezy-primary mb-3"
              >
                Proceed to Checkout
              </button>
              <Link
                href="/"
                className="block text-center text-xs uppercase tracking-[0.1em] text-gray-600 hover:text-black transition-colors py-2"
              >
                Continue Shopping
              </Link>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2.5 text-[10px] uppercase tracking-wider text-gray-500">
                <p className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure checkout
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Free shipping over $5,000
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  14-day returns
                </p>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <>
      <main className="min-h-screen">
        <Header showBackButton={true} />
        {items.length === 0 ? emptyState : cartContent}
        <Footer />
      </main>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        total={total}
        onSuccess={handleCheckoutSuccess}
      />
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
