'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <main className="min-h-screen">
        <Header showBackButton={false} />

        <section className="border-b border-gray-200 bg-white">
          <div className="yeezy-container py-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Checkout Success' }]} />
          </div>
        </section>

        <section className="yeezy-hero bg-black text-white">
          <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
            <div className="inline-block mb-8">
              <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="yeezy-main-logo text-white mb-8">
              ORDER COMPLETE
            </h1>
            <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>
        </section>

        <section className="yeezy-section">
          <div className="yeezy-container max-w-2xl">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-light tracking-tight mb-3 text-gray-900">Payment Successful</h2>
                  <p className="yeezy-body text-base text-gray-600 mb-6">
                    We've received your payment and are processing your order. You'll receive a confirmation email shortly with your order details and tracking information.
                  </p>
                </div>

                {paymentIntentId && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Payment Reference</p>
                    <p className="font-mono text-gray-700">{paymentIntentId}</p>
                  </div>
                )}

                <div className="pt-6 space-y-3">
                  <Link
                    href="/shop"
                    className="btn-yeezy-primary inline-block w-full sm:w-auto"
                  >
                    Continue Shopping
                  </Link>
                  <div>
                    <Link
                      href="/"
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors inline-block"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-8">
                  <p className="text-xs text-gray-500 mb-4">What happens next?</p>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium mt-0.5">
                        1
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-0.5">Order Confirmation</p>
                        <p>You'll receive an email confirmation within a few minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium mt-0.5">
                        2
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-0.5">Processing</p>
                        <p>We'll carefully prepare your artwork for shipping</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium mt-0.5">
                        3
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-0.5">Shipping</p>
                        <p>You'll receive tracking information once your order ships</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
