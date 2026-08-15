'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { PublicArtwork } from '@/lib/public-data';
import { ShoppingBag, ArrowRight, Check, MessageSquare } from 'lucide-react';

export default function ArtworkActions({ artwork }: { artwork: PublicArtwork }) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const purchasable = artwork.status === 'AVAILABLE' && artwork.availableForSale && artwork.price > 0;

  if (!purchasable) {
    return (
      <div className="mt-4">
        <Link
          href={`/contact?subject=${encodeURIComponent(`Artwork enquiry: ${artwork.title}`)}`}
          className="w-full py-4 px-6 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-sm md:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-center"
        >
          <MessageSquare size={18} />
          Inquire to Purchase
        </Link>
      </div>
    );
  }

  const alreadyInCart = isInCart(artwork.id);

  const handleBuyNow = () => {
    setIsRedirecting(true);
    if (!alreadyInCart) {
      addToCart(artwork);
    }
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!alreadyInCart) {
      addToCart(artwork);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* Primary Purchase / Buy Button */}
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isRedirecting}
        className="w-full py-4 px-6 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-sm md:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75"
      >
        <ShoppingBag size={18} />
        {isRedirecting ? 'Proceeding to Checkout...' : 'Buy Now'}
        <ArrowRight size={18} />
      </button>

      {/* Secondary Add to Cart / View Cart Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={alreadyInCart}
          className={`flex-1 py-3 px-4 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer
            ${alreadyInCart
              ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
              : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-[var(--foreground)] hover:text-[var(--accent-purple)] bg-white'
            }`}
        >
          {alreadyInCart ? (
            <>
              <Check size={14} />
              In Cart
            </>
          ) : (
            'Add to Cart'
          )}
        </button>

        {alreadyInCart && (
          <Link
            href="/cart"
            className="py-3 px-5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold bg-gray-100 hover:bg-gray-200 text-[var(--foreground)] transition-colors flex items-center justify-center"
          >
            View Cart
          </Link>
        )}
      </div>
    </div>
  );
}
