'use client';

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import FormInput from '@/components/forms/FormInput';
import FormTextarea from '@/components/forms/FormTextarea';
import { checkoutFormSchema, type CheckoutFormValues } from '@/lib/validations/schemas';

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setProcessing(false);
    } else {
      clearCart();
      router.push('/checkout/success');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="rounded-lg p-4 text-sm bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full btn-yeezy-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setError(null);

    try {
      // Step 1: Create order
      const orderPayload = {
        ...values,
        total,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data?.message || 'Unable to create order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Create payment intent
      const paymentResponse = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'zar',
          metadata: {
            orderId: orderData.id,
            orderNumber: orderData.order_number || orderData.id,
            customerEmail: values.email,
            paymentType: 'full',
          },
        }),
      });

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json();
        throw new Error(data?.error || 'Unable to initialize payment');
      }

      const { clientSecret: secret } = await paymentResponse.json();
      setClientSecret(secret);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
      colorBackground: '#ffffff',
      colorText: '#000000',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <>
      <main className="min-h-screen">
        <Header showBackButton={true} />

        <section className="border-b border-gray-200 bg-white">
          <div className="yeezy-container py-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
          </div>
        </section>

        <section className="yeezy-hero bg-black text-white">
          <div className="yeezy-hero-content fade-in-slow">
            <h1 className="yeezy-main-logo text-white mb-8">
              CHECKOUT
            </h1>
            <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
              Complete your purchase securely.
            </p>
          </div>
        </section>

        <section className="yeezy-section">
          <div className="yeezy-container max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 fade-in-slow" style={{ animationDelay: '0.3s' }}>
              {/* Checkout Form */}
              <div className="space-y-8">
                {!clientSecret ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6 pb-4 border-b border-gray-200">
                      Shipping Information
                    </h2>
                    <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5">
                      <FormInput
                        label="Full Name"
                        registration={register('name')}
                        error={errors.name?.message}
                        placeholder="Your full name"
                      />

                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormInput
                          label="Email"
                          type="email"
                          autoComplete="email"
                          registration={register('email')}
                          error={errors.email?.message}
                          placeholder="your@email.com"
                        />

                        <FormInput
                          label="Phone"
                          optionalText="optional"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          registration={register('phone')}
                          error={errors.phone?.message}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <FormTextarea
                        label="Shipping Address"
                        rows={3}
                        registration={register('address')}
                        error={errors.address?.message}
                        placeholder="Street address, city, state, zip code"
                      />

                      <FormTextarea
                        label="Special Notes"
                        optionalText="optional"
                        rows={3}
                        registration={register('notes')}
                        error={errors.notes?.message}
                        placeholder="Framing preferences, delivery windows, or other special requests"
                      />

                      {error && (
                        <div className="rounded-lg p-4 text-sm bg-red-50 text-red-700 border border-red-200">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-yeezy-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Continue to Payment'
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6 pb-4 border-b border-gray-200">
                      Payment Information
                    </h2>
                    {stripePromise && clientSecret && (
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                        <CheckoutForm clientSecret={clientSecret} />
                      </Elements>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secured by Stripe. Supports Apple Pay, Google Pay, and cards.</span>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6 pb-4 border-b border-gray-200">
                    Order Summary
                  </h2>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.variantSelections?.frameVariantId}-${item.variantSelections?.canvasVariantId}`} className="flex gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.artist}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {item.variantSelections && (
                            <div className="mt-1 text-[10px] text-gray-600">
                              {item.variantSelections.frameVariantName && (
                                <p>Frame: {item.variantSelections.frameVariantName}</p>
                              )}
                              {item.variantSelections.canvasVariantName && (
                                <p>Canvas: {item.variantSelections.canvasVariantName}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-light whitespace-nowrap">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4 mb-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Subtotal</span>
                      <span className="text-lg font-light">${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Shipping</span>
                      <span className="text-sm text-gray-500">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
                      <span className="text-sm uppercase tracking-[0.1em] text-gray-600">Total</span>
                      <span className="text-2xl font-light">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 space-y-2.5 text-[10px] uppercase tracking-wider text-gray-500">
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure checkout
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Free shipping over $5,000
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      14-day returns
                    </p>
                  </div>
                </div>

                <Link
                  href="/cart"
                  className="block text-center mt-4 text-xs uppercase tracking-[0.1em] text-gray-600 hover:text-black transition-colors py-2"
                >
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
