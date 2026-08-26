'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { validateOrderInput, ValidationError } from '@/lib/validation';
import { ArrowLeft, CreditCard, ShoppingBag, Truck, MapPin, UserCircle, AlertCircle, X } from 'lucide-react';
import Footer from '@/components/Footer';

const NIGERIAN_STATES = [
  'Anambra', 'Lagos', 'FCT - Abuja', 'Enugu', 'Rivers', 'Abia', 'Delta', 'Imo',
  'Ogun', 'Oyo', 'Akwa Ibom', 'Edo', 'Cross River', 'Adamawa', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Ebonyi', 'Ekiti', 'Gombe', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ondo', 'Osun',
  'Plateau', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function CheckoutPage() {
  const { cart, cartSubtotal } = useCart();
  const { isAuthenticated, profile, user } = useCustomerAuth();

  // Contact details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Structured delivery address fields
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('delivery');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Awka');
  const [state, setState] = useState('Anambra');
  const [landmark, setLandmark] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // UI States
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const checkoutIdRef = useRef<string | null>(null);

  // Pre-fill from profile when logged in
  useEffect(() => {
    if (isAuthenticated && profile) {
      const nameParts = (profile.displayName || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      if (profile.defaultAddress) {
        setStreetAddress(profile.defaultAddress);
      }
    }
  }, [isAuthenticated, profile]);

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
    const effectiveDeliveryAddress = deliveryOption === 'delivery'
      ? [
          streetAddress.trim(),
          landmark.trim() ? `(Landmark: ${landmark.trim()})` : '',
          city.trim(),
          state.trim(),
          'Nigeria',
        ]
          .filter(Boolean)
          .join(', ')
      : '';

    const validationErrors = validateOrderInput({
      customerName,
      email,
      phone,
      deliveryOption,
      deliveryAddress: deliveryOption === 'delivery' ? effectiveDeliveryAddress : undefined,
    });

    if (firstName.trim() === '') {
      validationErrors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (lastName.trim() === '') {
      validationErrors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (deliveryOption === 'delivery') {
      if (streetAddress.trim().length < 5) {
        validationErrors.push({ field: 'streetAddress', message: 'Please provide a street address (e.g. 12 Arthur Eze Avenue)' });
      }
      if (city.trim().length < 2) {
        validationErrors.push({ field: 'city', message: 'City / Town is required' });
      }
      if (!state.trim()) {
        validationErrors.push({ field: 'state', message: 'Please choose a state' });
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSubmitError(validationErrors[0]?.message || 'Please complete all required fields below.');
      setTimeout(() => {
        const firstErrField = document.querySelector('.border-red-400') || document.getElementById('checkout-error-banner');
        if (firstErrField) {
          firstErrField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setLoading(true);
    const checkoutId = checkoutIdRef.current || (checkoutIdRef.current = crypto.randomUUID());
    let responseReceived = false;

    try {
      const authToken = user ? await user.getIdToken() : '';
      // Call secure Paystack initialize route
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
        body: JSON.stringify({
          checkoutId,
          type: 'order',
          firstName,
          lastName,
          email,
          phone,
          deliveryOption,
          deliveryAddress: effectiveDeliveryAddress,
          orderNotes,
          items: cart.map((item) => ({
            productType: item.productType,
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      responseReceived = true;
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
    } catch (err: unknown) {
      console.error('Checkout submit error:', err);
      if (responseReceived) checkoutIdRef.current = null;
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(message);

      // Highlight field based on error message
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('delivery address') || lowerMsg.includes('shipping address')) {
        setErrors((prev) => [...prev.filter(e => e.field !== 'streetAddress'), { field: 'streetAddress', message }]);
        setDeliveryOption('delivery');
      } else if (lowerMsg.includes('email')) {
        setErrors((prev) => [...prev.filter(e => e.field !== 'email'), { field: 'email', message }]);
      } else if (lowerMsg.includes('phone')) {
        setErrors((prev) => [...prev.filter(e => e.field !== 'phone'), { field: 'phone', message }]);
      } else if (lowerMsg.includes('name')) {
        setErrors((prev) => [...prev.filter(e => e.field !== 'firstName'), { field: 'firstName', message }]);
      }

      setTimeout(() => {
        const banner = document.getElementById('checkout-error-banner');
        if (banner) {
          banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

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
            <p className="font-sans text-sm text-[var(--text-muted)] mb-6">Add artworks or studio materials to your cart before checking out.</p>
            <Link href="/art" className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors">
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

        <div className="mb-8 border-b border-[var(--border-soft)] pb-6">
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--accent-purple)] tracking-tight">Checkout</h1>
        </div>

        {submitError && (
          <div id="checkout-error-banner" className="p-4 md:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 flex items-start gap-3 shadow-sm mb-8">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-grow">
              <p className="font-mono text-xs uppercase tracking-wider font-bold text-red-900 mb-0.5">Please check your details</p>
              <p className="font-sans text-sm text-red-700 font-medium">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError('')}
              className="text-red-400 hover:text-red-700 transition-colors p-1"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Guest Sign-in Prompt */}
          {!isAuthenticated && (
            <div className="lg:col-span-3 flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)]">
              <UserCircle size={20} className="text-[var(--accent-purple)] shrink-0" />
              <p className="text-sm text-[var(--text-muted)]">
                <Link href="/account/login" className="text-[var(--accent-purple)] font-medium hover:text-[var(--accent-orange)] transition-colors">
                  Sign in
                </Link>
                {' '}for faster checkout, or continue as guest.
              </p>
            </div>
          )}
          
          {/* Checkout Form */}
          <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-8">
            
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
                    className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                      ${getFieldError('firstName') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                    `}
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
                    className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                      ${getFieldError('lastName') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                    `}
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
                    className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                      ${getFieldError('email') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                    `}
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
                    className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                      ${getFieldError('phone') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                    `}
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
                  onClick={() => {
                    setDeliveryOption('pickup');
                    clearError('deliveryAddress');
                  }}
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

              {deliveryOption === 'delivery' ? (
                <div className="flex flex-col gap-4 border-t border-[var(--border-soft)] pt-6">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Street Address / House No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => {
                        setStreetAddress(e.target.value);
                        clearError('streetAddress');
                      }}
                      placeholder="E.g. Plot 14, Aroma Junction, Arthur Eze Avenue"
                      className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                        ${getFieldError('streetAddress') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                      `}
                    />
                    {getFieldError('streetAddress') && (
                      <span className="text-red-500 text-xs font-mono">{getFieldError('streetAddress')}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                        City / Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          clearError('city');
                        }}
                        placeholder="Awka"
                        className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm
                          ${getFieldError('city') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                        `}
                      />
                      {getFieldError('city') && (
                        <span className="text-red-500 text-xs font-mono">{getFieldError('city')}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          clearError('state');
                        }}
                        className={`w-full bg-white border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm cursor-pointer
                          ${getFieldError('state') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'}
                        `}
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      {getFieldError('state') && (
                        <span className="text-red-500 text-xs font-mono">{getFieldError('state')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      Nearest Landmark / Delivery Directions (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="E.g. Near Regina Caeli Hospital / Behind Zenith Bank"
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-t border-[var(--border-soft)] pt-5 flex items-start gap-3 bg-[var(--surface-soft)]/50 p-4 rounded-xl">
                  <MapPin className="text-[var(--accent-purple)] shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                    <p className="font-serif font-bold text-sm text-[var(--foreground)] mb-0.5">Artsy by Oma Studio Pickup</p>
                    <p>Awka, Anambra State, Nigeria. We will prepare your order and email you pickup details right after payment.</p>
                  </div>
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
                <div key={`${item.productType}:${item.productId}`} className="flex gap-4 items-center">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)] flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-serif text-sm font-semibold truncate text-[var(--foreground)]">{item.title}</h4>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{item.productType === 'material' ? `Quantity: ${item.quantity}` : '1-of-1 Artwork'}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
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

            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs flex items-start gap-2.5 shadow-sm">
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <span className="font-mono font-bold block text-red-900 mb-0.5">Action Required</span>
                  <span className="leading-snug">{submitError}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
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
              We process secure payments in Nigerian Naira. Your items remain available to others until payment status is server-verified.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
