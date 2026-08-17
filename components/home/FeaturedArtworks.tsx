'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getArtworks } from '@/lib/firebase/services/artworks';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/firebase/services/wishlist';
import { Artwork } from '@/lib/types';
import { ArrowRight, Eye, Heart, Loader2 } from 'lucide-react';

export default function FeaturedArtworks() {
  const router = useRouter();
  const { user } = useCustomerAuth();
  const { showToast } = useToast();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const all = await getArtworks();
        // Load featured items
        const featured = all.filter((art) => art.featured).slice(0, 3);
        const list = featured.length > 0 ? featured : all.slice(0, 3);
        setArtworks(list);

        if (user && list.length > 0) {
          const map: Record<string, boolean> = {};
          await Promise.all(
            list.map(async (art) => {
              try {
                map[art.id] = await isInWishlist(user.uid, art.id);
              } catch (e) {
                console.error(e);
              }
            })
          );
          setSavedMap(map);
        }
      } catch (e) {
        console.error('Failed to load featured artworks:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [user]);

  const handleToggleSave = async (e: React.MouseEvent, art: Artwork) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to save artworks to your wishlist.', 'warning', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/account/login?redirect=/'),
        },
      });
      return;
    }

    setSavingMap((prev) => ({ ...prev, [art.id]: true }));
    const isCurrentlySaved = !!savedMap[art.id];

    try {
      if (isCurrentlySaved) {
        await removeFromWishlist(user.uid, art.id);
        setSavedMap((prev) => ({ ...prev, [art.id]: false }));
        showToast(`"${art.title}" removed from your saved artworks.`, 'info');
      } else {
        await addToWishlist(user.uid, {
          artworkId: art.id,
          title: art.title,
          price: art.price,
          image: art.images?.[0] || '',
        });
        setSavedMap((prev) => ({ ...prev, [art.id]: true }));
        showToast(`"${art.title}" saved to your wishlist!`, 'success');
      }
    } catch (err: any) {
      console.error('Error saving artwork:', err);
      showToast(err?.message || 'Failed to update saved artwork.', 'error');
    } finally {
      setSavingMap((prev) => ({ ...prev, [art.id]: false }));
    }
  };

  if (loading || artworks.length === 0) {
    return null; // Silent hide during loading on homepage
  }

  const getStatusLabel = (art: Artwork) => {
    switch (art.status) {
      case 'AVAILABLE':
        return 'Available';
      case 'SOLD':
        return 'Sold';
      case 'COMMISSIONED':
        return 'Commissioned';
      case 'RESERVED':
        return 'Reserved';
      case 'PORTFOLIO_ONLY':
      default:
        return 'Exhibition';
    }
  };

  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-[90vw] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-2">Art Shop</p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-[var(--foreground)]">
              Featured Artworks
            </h2>
          </div>
          <Link
            href="/art"
            className="font-mono text-xs uppercase tracking-widest text-[var(--accent-purple)] hover:text-[var(--accent-orange)] transition-colors flex items-center gap-1"
          >
            Explore Full Gallery
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((art) => {
            const isSaved = !!savedMap[art.id];
            const isSaving = !!savingMap[art.id];

            return (
              <article
                key={art.id}
                className="section-shell p-5 flex flex-col gap-4 bg-[var(--background)] hover:[box-shadow:var(--shadow-soft)] transition-all duration-500 group relative"
              >
                {/* Image Container */}
                <div className="relative">
                  <Link
                    href={`/art/${art.slug}`}
                    className="block relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)]"
                  >
                    <Image
                      src={art.images?.[0] || '/images/artist-studio.png'}
                      alt={art.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold border shadow-sm
                        ${art.status === 'AVAILABLE' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                        }
                      `}>
                        {getStatusLabel(art)}
                      </span>
                    </div>
                  </Link>

                  {/* Save to Wishlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSave(e, art)}
                    disabled={isSaving}
                    aria-label={isSaved ? `Remove ${art.title} from wishlist` : `Save ${art.title} to wishlist`}
                    title={isSaved ? 'Saved in Wishlist' : 'Save Artwork'}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all cursor-pointer z-10 ${
                      isSaved
                        ? 'bg-white text-pink-600 border border-pink-200 opacity-100 scale-105'
                        : 'bg-white/80 hover:bg-white text-gray-700 hover:text-pink-600 opacity-90 group-hover:opacity-100'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin text-[var(--accent-purple)]" />
                    ) : (
                      <Heart size={15} className={isSaved ? 'fill-pink-500 text-pink-500' : ''} />
                    )}
                  </button>
                </div>

                {/* Text */}
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-serif text-2xl truncate group-hover:text-[var(--accent-purple)] transition-colors">
                    <Link href={`/art/${art.slug}`}>{art.title}</Link>
                  </h3>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{art.year}</span>
                </div>

                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] -mt-2">
                  {art.medium}
                </p>

                {/* Price & Action */}
                <div className="flex justify-between items-center border-t border-[var(--border-soft)] pt-4 mt-2">
                  <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                    {art.status === 'AVAILABLE' ? `₦${art.price.toLocaleString()}` : 'Price on request'}
                  </span>
                  
                  <Link
                    href={`/art/${art.slug}`}
                    className="px-4 py-2 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-mono text-[10px] uppercase tracking-widest rounded-full hover:bg-[var(--accent-primary)] hover:text-white transition-all flex items-center gap-1"
                  >
                    <Eye size={12} />
                    View Artwork
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export const dynamic = 'force-dynamic';
