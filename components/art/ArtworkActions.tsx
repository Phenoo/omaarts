'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/firebase/services/wishlist';
import { PublicArtwork } from '@/lib/public-data';
import { ShoppingBag, ArrowRight, Check, MessageSquare, Heart, Loader2 } from 'lucide-react';

export default function ArtworkActions({ artwork }: { artwork: PublicArtwork }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCustomerAuth();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const purchasable = artwork.status === 'AVAILABLE' && artwork.availableForSale && artwork.price > 0;
  const alreadyInCart = isInCart(artwork.id);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setIsSaved(false);
      return;
    }

    const checkSaved = async () => {
      try {
        const saved = await isInWishlist(user.uid, artwork.id);
        if (isMounted) setIsSaved(saved);
      } catch (err) {
        console.error('Failed to check wishlist status:', err);
      }
    };

    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [user, artwork.id]);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please sign in to save artworks to your wishlist.', 'warning', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/account/login?redirect=${encodeURIComponent(pathname || `/art/${artwork.slug}`)}`),
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await removeFromWishlist(user.uid, artwork.id);
        setIsSaved(false);
        showToast(`"${artwork.title}" removed from your saved artworks.`, 'info');
      } else {
        await addToWishlist(user.uid, {
          artworkId: artwork.id,
          title: artwork.title,
          price: artwork.price,
          image: artwork.images[0] || '',
        });
        setIsSaved(true);
        showToast(`"${artwork.title}" saved to your wishlist!`, 'success');
      }
    } catch (err: any) {
      console.error('Error saving artwork:', err);
      showToast(err?.message || 'Failed to update saved artwork. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
      showToast(`Added "${artwork.title}" to your cart.`, 'success');
    }
  };

  if (!purchasable) {
    return (
      <div className="mt-4 flex flex-col gap-3">
        <Link
          href={`/contact?subject=${encodeURIComponent(`Artwork enquiry: ${artwork.title}`)}`}
          className="w-full py-4 px-6 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-sm md:text-base font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-center"
        >
          <MessageSquare size={18} />
          Inquire to Purchase
        </Link>

        {/* Save to Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`w-full py-3.5 px-4 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer
            ${isSaved
              ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
              : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-[var(--foreground)] hover:text-[var(--accent-purple)] bg-white'
            }`}
        >
          {isSaving ? (
            <Loader2 size={15} className="animate-spin text-[var(--accent-purple)]" />
          ) : (
            <Heart size={15} className={isSaved ? 'fill-pink-500 text-pink-500' : ''} />
          )}
          {isSaved ? 'Saved to Wishlist' : 'Save Artwork'}
        </button>
      </div>
    );
  }

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

      {/* Secondary Add to Cart & Save to Wishlist Buttons */}
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

        {alreadyInCart ? (
          <Link
            href="/cart"
            className="py-3 px-5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold bg-gray-100 hover:bg-gray-200 text-[var(--foreground)] transition-colors flex items-center justify-center"
          >
            View Cart
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isSaved ? 'Remove from saved artworks' : 'Save artwork'}
            title={isSaved ? 'Saved to Wishlist' : 'Save Artwork'}
            className={`py-3 px-4 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer
              ${isSaved
                ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-[var(--foreground)] hover:text-[var(--accent-purple)] bg-white'
              }`}
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin text-[var(--accent-purple)]" />
            ) : (
              <Heart size={14} className={isSaved ? 'fill-pink-500 text-pink-500' : ''} />
            )}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}
      </div>

      {/* When already in cart, show Save button as extra row */}
      {alreadyInCart && (
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className={`w-full py-2.5 px-4 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer
            ${isSaved
              ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
              : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-[var(--foreground)] hover:text-[var(--accent-purple)] bg-white'
            }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin text-[var(--accent-purple)]" />
          ) : (
            <Heart size={14} className={isSaved ? 'fill-pink-500 text-pink-500' : ''} />
          )}
          <span>{isSaved ? 'Saved in Wishlist' : 'Save Artwork'}</span>
        </button>
      )}
    </div>
  );
}
