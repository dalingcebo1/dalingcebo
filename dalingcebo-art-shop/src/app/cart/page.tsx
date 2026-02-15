'use client';

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import CheckoutModal from '@/components/CheckoutModal';
import PageShell from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Minus, Plus, Trash2, Clock, Shield, Package, RotateCcw } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, total, maxProcessingDays } = useCart();
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
    <PageShell
      title="CART"
      subtitle="Your shopping cart is currently empty."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
      maxWidth="narrow"
    >
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-6" aria-hidden="true" />
            <h2 className="text-2xl font-light tracking-tight mb-3 text-gray-900">Your Cart is Empty</h2>
            <p className="yeezy-body text-base text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring our collection and add artwork that speaks to you.
            </p>
            <Link
              href="/shop"
              className="btn-yeezy-primary inline-block"
              aria-label="Browse artwork collection"
            >
              Explore Collection
            </Link>
            <div className="mt-6">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </PageShell>
  );

  const cartContent = (
    <PageShell
      title="CART"
      subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'} ready for checkout.`}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
      maxWidth="wide"
    >
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
              <div>
                <h2 className="yeezy-subheading text-sm mb-2 tracking-[0.3em] text-gray-600">SHOPPING CART</h2>
                <p className="yeezy-body text-base text-gray-700">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
              <button
                onClick={handleClearCart}
                className="text-xs uppercase tracking-[0.1em] text-red-600 hover:text-red-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                aria-label="Clear all items from cart"
              >
                Clear Cart
              </button>
            </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <Link 
                    href={`/artwork/${item.id}`} 
                    className="relative w-full sm:w-24 h-40 sm:h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden group"
                    aria-label={`View ${item.title}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/artwork/${item.id}`}
                          className="text-lg sm:text-xl font-light tracking-tight hover:underline mb-1 block truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">{item.artist}</p>
                        {item.variantSelections && (
                          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                            {item.variantSelections.frameVariantName && (
                              <p>Frame: {item.variantSelections.frameVariantName}</p>
                            )}
                            {item.variantSelections.canvasVariantName && (
                              <p>Canvas: {item.variantSelections.canvasVariantName}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-lg sm:text-xl font-light whitespace-nowrap">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500 mb-3">
                        ${item.price.toLocaleString()} each
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={item.quantity <= 1 ? 'opacity-40 cursor-not-allowed' : ''}
                            aria-label="Decrease quantity"
                            aria-disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" aria-hidden="true" />
                          </Button>
                          <span className="w-8 text-center font-medium" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          removeFromCart(item.id);
                          setToastMessage('Item removed from cart');
                          setShowToast(true);
                        }}
                        className="text-xs uppercase tracking-[0.1em] text-red-600 hover:text-red-800 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        Remove
                      </Button>
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
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Subtotal</span>
                  <span className="text-lg font-light">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
                  <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Total</span>
                  <span className="text-2xl font-light">${total.toLocaleString()}</span>
                </div>
              </div>
              
              {maxProcessingDays > 0 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" aria-hidden="true" />
                    <div className="text-xs text-blue-900">
                      <p className="font-medium uppercase tracking-wide mb-1">Processing Time</p>
                      <p className="text-blue-800">Estimated {maxProcessingDays} business day{maxProcessingDays !== 1 ? 's' : ''} for fulfillment</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Link
                href="/checkout"
                className="w-full btn-yeezy-primary mb-3 block text-center"
                aria-label="Proceed to checkout"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/shop"
                className="block text-center text-xs uppercase tracking-[0.1em] text-gray-600 hover:text-black transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Continue Shopping
              </Link>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2.5 text-[10px] uppercase tracking-wider text-gray-500">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Secure checkout
                </p>
                <p className="flex items-center gap-2">
                  <Package className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Free shipping over $5,000
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                  14-day returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </PageShell>
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
