'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { cart, removeFromCart, cartSubtotal, cartCount } = useCart();

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Header */}
        <div className="mb-12 border-b border-[var(--border-soft)] pb-8 flex justify-between items-baseline">
          <h1 className="font-serif text-5xl md:text-7xl text-[var(--accent-purple)] tracking-tight">
            Shopping Cart
          </h1>
          <span className="font-mono text-sm uppercase tracking-widest text-[var(--text-muted)]">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cart.length === 0 ? (
          /* Empty State */
          <div className="section-shell p-12 text-center flex flex-col items-center justify-center gap-6 max-w-xl mx-auto my-12 bg-white/70">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--accent-purple)]">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-[var(--foreground)]">Your cart is empty</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] max-w-sm">
              Discover original paintings, contemporary mixed media, and studio materials available for purchase in our shop.
            </p>
            <Link
              href="/art"
              className="mt-2 px-8 py-3 rounded-full bg-[var(--accent-purple)] text-white font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors"
            >
              Explore Art Shop
            </Link>
          </div>
        ) : (
          /* Cart List & Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* List */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {cart.map((item) => (
                <div
                  key={`${item.productType}:${item.productId}`}
                  className="section-shell p-4 md:p-5 flex flex-col sm:flex-row items-center gap-6 bg-white/80"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)] flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow text-center sm:text-left flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent-orange)] bg-[var(--surface-soft)]/50 px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">
                      {item.productType === 'material' ? 'Studio material' : 'Original Art (1-of-1)'}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl text-[var(--foreground)]">{item.title}</h3>
                    <p className="font-mono text-xs text-[var(--text-muted)]">Quantity: {item.quantity}{item.productType === 'artwork' ? ' (Limited Edition)' : ''}</p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <span className="font-mono text-base md:text-lg font-bold text-[var(--foreground)]">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.productType)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="section-shell p-6 md:p-8 bg-white flex flex-col gap-6 shadow-md border border-[var(--border-soft)]">
              <h3 className="font-serif text-2xl text-[var(--accent-purple)]">Order Summary</h3>
              
              <div className="flex flex-col gap-3 font-mono text-sm border-b border-[var(--border-soft)] pb-5">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--foreground)]">₦{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Delivery</span>
                  <span className="text-xs uppercase tracking-wider text-[var(--accent-orange)]">Calculated next</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-serif text-lg font-bold text-[var(--foreground)]">Estimated Total</span>
                <span className="font-mono text-2xl font-bold text-[var(--accent-orange)]">
                  ₦{cartSubtotal.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>

              <p className="text-[10px] font-sans text-center text-[var(--text-muted)] leading-relaxed">
                Items are reserved only while checkout is being verified. Items in cart are not secured until paid.
              </p>
            </div>
            
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
