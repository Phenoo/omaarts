'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { useCart } from '@/lib/context/CartContext';
import { getWishlist, removeFromWishlist } from '@/lib/firebase/services/wishlist';
import { WishlistItem } from '@/lib/types';
import { Heart, ShoppingCart, Trash2, Loader2, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  const { user } = useCustomerAuth();
  const { addToCart, isInCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      try {
        const wishlist = await getWishlist(user.uid);
        setItems(wishlist);
      } catch (e) {
        console.error('Error fetching wishlist:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemove = async (artworkId: string) => {
    if (!user) return;
    setRemovingId(artworkId);
    try {
      await removeFromWishlist(user.uid, artworkId);
      setItems((prev) => prev.filter((item) => item.artworkId !== artworkId));
    } catch (e) {
      console.error('Error removing from wishlist:', e);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.artworkId,
      title: item.title,
      price: item.price,
      images: [item.image],
    } as Parameters<typeof addToCart>[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[var(--accent-purple)]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl tracking-tight">Saved Artworks</h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {items.length} {items.length === 1 ? 'artwork' : 'artworks'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="section-shell p-12 text-center bg-white/80">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-pink-500" />
            </div>
            <h3 className="font-serif text-2xl mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Browse our art collection and save pieces you love.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Explore Art Shop
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.artworkId}
                className="section-shell overflow-hidden bg-white/80 group"
              >
                {/* Image */}
                <Link href={`/shop/${item.artworkId}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-soft)]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/shop/${item.artworkId}`}>
                    <h3 className="font-serif text-lg tracking-tight hover:text-[var(--accent-purple)] transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="font-mono text-sm font-medium mt-1">
                    ₦{item.price?.toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {isInCart(item.artworkId) ? (
                      <span className="flex-1 text-center px-4 py-2.5 rounded-full bg-green-50 text-green-700 font-mono text-[10px] uppercase tracking-widest border border-green-200">
                        In Cart
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                      >
                        <ShoppingCart size={13} />
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(item.artworkId)}
                      disabled={removingId === item.artworkId}
                      className="p-2.5 rounded-full border border-[var(--border-soft)] hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-[var(--text-muted)] transition-all cursor-pointer disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removingId === item.artworkId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </>
  );
}
