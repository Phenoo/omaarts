'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { PublicArtwork } from '@/lib/public-data';
import { formatNaira } from '@/lib/site';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/firebase/services/wishlist';
import { Heart, Loader2 } from 'lucide-react';

export default function ArtworkCard({ artwork }: { artwork: PublicArtwork }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCustomerAuth();
  const { showToast } = useToast();

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setIsSaved(false);
      return;
    }

    const checkWishlist = async () => {
      try {
        const saved = await isInWishlist(user.uid, artwork.id);
        if (isMounted) setIsSaved(saved);
      } catch (err) {
        console.error('Failed to check wishlist status in card:', err);
      }
    };

    checkWishlist();
    return () => {
      isMounted = false;
    };
  }, [user, artwork.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to save artworks to your wishlist.', 'warning', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/account/login?redirect=${encodeURIComponent(pathname || '/art')}`),
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
    } catch (err: unknown) {
      console.error('Error saving artwork:', err);
      showToast(err instanceof Error ? err.message : 'Failed to update saved artwork. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const priceLabel = artwork.status === 'AVAILABLE' && artwork.price > 0
    ? formatNaira(artwork.price)
    : 'Price on request';

  const isNairaPrice = artwork.status === 'AVAILABLE' && artwork.price > 0;

  return (
    <article className="art-card group relative">
      {/* Image and Quick Save Button */}
      <div className="relative">
        <Link href={`/art/${artwork.slug}`} className="block" aria-label={`View ${artwork.title}`}>
          <div className="art-card__image">
            <Image
              src={artwork.images[0]}
              alt={`${artwork.title}, ${artwork.medium} by Oma Achebe`}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        {/* Quick Save (Heart) button on card image */}
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          aria-label={isSaved ? `Remove ${artwork.title} from saved artworks` : `Save ${artwork.title} to wishlist`}
          title={isSaved ? 'Saved in Wishlist' : 'Save Artwork'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer z-10 ${
            isSaved
              ? 'bg-white text-pink-600 border border-pink-200 opacity-100 scale-105'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-pink-600 opacity-90 group-hover:opacity-100'
          }`}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin text-[var(--accent-purple)]" />
          ) : (
            <Heart size={16} className={isSaved ? 'fill-pink-500 text-pink-500' : ''} />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl leading-tight tracking-tight">
            <Link href={`/art/${artwork.slug}`} className="hover:text-[var(--accent-purple)] transition-colors">
              {artwork.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{artwork.medium}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{artwork.year}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3">
        <span className={isNairaPrice ? "font-mono text-lg md:text-xl font-bold tracking-tight text-[var(--foreground)]" : "font-mono text-xs uppercase tracking-[0.14em] font-semibold text-[var(--accent-orange)]"}>
          {priceLabel}
        </span>
        <Link
          href={`/art/${artwork.slug}`}
          className="px-4 py-2.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-sm hover:shadow inline-flex items-center justify-center text-center"
        >
          {isNairaPrice ? 'Buy Now' : 'View Work'}
        </Link>
      </div>
    </article>
  );
}
