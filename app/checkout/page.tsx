'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { validateOrderInput, ValidationError } from '@/lib/validation';
import { ArrowLeft, CreditCard, ShoppingBag, Truck, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartCount, clearCart } = useCart();

  // Contact details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Delivery options
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // UI States
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Delivery Fee configuration (e.g. NGN 3,000 within Nigeria/Awka)
  const defaultDeliveryFee = 3000;
  const deliveryFee = deliveryOption === 'delivery' ? defaultDeliveryFee : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const clearError = (field: string) => {
    setErrors((prev) => prev.filter((err) => err.field !== field));
  };

  const getFieldError = (field: string) => {
    return errors.find((err) => err.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (cart.length === 0) {
      setSubmitError('Your cart is empty. Cannot proceed.');
      return;
    }

    const customerName = `${firstName} ${lastName}`.trim();
    const validationErrors = validateOrderInput({
      customerName,
      email,
      phone,
      deliveryOption,
      deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
    });

    if (firstName.trim() === '') {
      validationErrors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (lastName.trim() === '') {
      validationErrors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Call secure Paystack initialize route
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          firstName,
          lastName,
          email,
          phone,
          deliveryOption,
          deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : '',
          orderNotes,
          items: cart.map((item) => ({
            artworkId: item.artworkId,
            title: item.title,
            price: item.price,
            quantity: 1,
          })),
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        throw new Error(resData.error || 'Checkout initialization failed');
      }

      if (resData.authorizationUrl) {
        // Redirect to Paystack Gateway
        window.location.href = resData.authorizationUrl;
      } else {
        throw new Error('Server did not return a transaction URL');
      }
    } catch (err: any) {
      console.error('Checkout submit error:', err);
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
        <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow flex items-center justify-center">
          <div className="section-shell p-10 text-center max-w-md bg-white">
            <ShoppingBag className="mx-auto text-[var(--accent-purple)] mb-4" size={40} />
            <h2 className="font-serif text-2xl mb-2">Cart is empty</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] mb-6">Add artworks to your cart before checking out.</p>
            <Link href="/shop" className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors">
              Go to Art Shop
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Back navigation */}
        <Link href="/cart" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors mb-10">
          <ArrowLeft size={14} />
          Back to Cart
        </Link>

        <div className="mb-12 border-b border-[var(--border-soft)] pb-8">
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--accent-purple)] tracking-tight">Checkout</h1>
        </div>

        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-mono text-xs mb-8">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. Contact Details */}
            <div className="section-shell p-6 md:p-8 bg-white/90 flex flex-col gap-6">
              <h2 className="font-serif text-2xl text-[var(--accent-purple)]">Contact Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError('firstName');
                    }}
                    placeholder="Ada"
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
                  />
                  {getFieldError('firstName') && (
                    <span className="text-red-500 text-xs font-mono">{getFieldError('firstName')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearError('lastName');
                    }}
                    placeholder="Eze"
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
                  />
                  {getFieldError('lastName') && (
                    <span className="text-red-500 text-xs font-mono">{getFieldError('lastName')}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError('email');
                    }}
                    placeholder="ada.eze@example.com"
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
                  />
                  {getFieldError('email') && (
                    <span className="text-red-500 text-xs font-mono">{getFieldError('email')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError('phone');
                    }}
                    placeholder="08167009545"
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
                  />
                  {getFieldError('phone') && (
                    <span className="text-red-500 text-xs font-mono">{getFieldError('phone')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Delivery Option */}
            <div className="section-shell p-6 md:p-8 bg-white/90 flex flex-col gap-6">
              <h2 className="font-serif text-2xl text-[var(--accent-purple)]">Fulfilment Options</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('pickup')}
                  className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer
                    ${deliveryOption === 'pickup'
                      ? 'border-[var(--accent-purple)] bg-[var(--surface-soft)]/40'
                      : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] bg-white'
                    }
                  `}
                >
                  <MapPin className="text-[var(--accent-purple)]" size={20} />
                  <div>
                    <span className="block font-serif text-base font-semibold">Studio Pickup</span>
                    <span className="block font-sans text-xs text-[var(--text-muted)]">Pick up in Awka (Free)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption('delivery')}
                  className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer
                    ${deliveryOption === 'delivery'
                      ? 'border-[var(--accent-purple)] bg-[var(--surface-soft)]/40'
                      : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] bg-white'
                    }
                  `}
                >
                  <Truck className="text-[var(--accent-purple)]" size={20} />
                  <div>
                    <span className="block font-serif text-base font-semibold">Delivery</span>
                    <span className="block font-sans text-xs text-[var(--text-muted)]">NGN {defaultDeliveryFee.toLocaleString()} Flat Rate</span>
                  </div>
                </button>
              </div>

              {deliveryOption === 'delivery' && (
                <div className="flex flex-col gap-1 border-t border-[var(--border-soft)] pt-6">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      clearError('deliveryAddress');
                    }}
                    placeholder="Enter complete shipping address (Street, City, State)"
                    rows={3}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm resize-none"
                  />
                  {getFieldError('deliveryAddress') && (
                    <span className="text-red-500 text-xs font-mono">{getFieldError('deliveryAddress')}</span>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1 border-t border-[var(--border-soft)] pt-6">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Order Notes (Optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notes for framing, package customization or special delivery directions..."
                  rows={2}
                  className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm resize-none"
                />
              </div>
            </div>

          </form>

          {/* Cart Summary */}
          <div className="section-shell p-6 md:p-8 bg-white flex flex-col gap-6 shadow-md border border-[var(--border-soft)]">
            <h3 className="font-serif text-2xl text-[var(--accent-purple)]">Your Order</h3>
            
            {/* Items */}
            <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-5 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.artworkId} className="flex gap-4 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)] flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-serif text-sm font-semibold truncate text-[var(--foreground)]">{item.title}</h4>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">1-of-1 Artwork</span>
                  </div>
                  <span className="font-mono text-xs font-semibold">₦{item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-3 font-mono text-sm border-b border-[var(--border-soft)] pb-5">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Items Subtotal</span>
                <span className="text-[var(--foreground)]">₦{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Delivery</span>
                <span className="text-[var(--foreground)]">
                  {deliveryOption === 'delivery' ? `₦${deliveryFee.toLocaleString()}` : 'Free (Pickup)'}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-serif text-lg font-bold text-[var(--foreground)]">Total Amount</span>
              <span className="font-mono text-2xl font-bold text-[var(--accent-orange)]">
                ₦{grandTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 rounded-full font-mono text-xs uppercase tracking-widest font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm
                ${loading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white'
                }
              `}
            >
              <CreditCard size={14} />
              {loading ? 'Initializing Checkout...' : `Pay ₦${grandTotal.toLocaleString()}`}
            </button>

            <p className="text-[10px] font-sans text-center text-[var(--text-muted)] leading-relaxed">
              We process secure payments in Nigerian Naira. Your artwork remains available to others until payment status is server-verified.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
