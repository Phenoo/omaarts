'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getArtworkBySlug, getArtworks } from '@/lib/firebase/services/artworks';
import { Artwork } from '@/lib/types';
import { useCart } from '@/lib/context/CartContext';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/firebase/services/wishlist';
import { ArrowLeft, Check, ShoppingCart, HelpCircle, ShieldAlert, Heart, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArtworkDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const { user } = useCustomerAuth();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [related, setRelated] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(false);
      try {
        const item = await getArtworkBySlug(slug);
        if (item) {
          setArtwork(item);
          // Fetch related artworks in same category/medium
          const all = await getArtworks();
          const filtered = all
            .filter((a) => a.id !== item.id && (a.categoryId === item.categoryId || a.medium === item.medium))
            .slice(0, 3);
          setRelated(filtered);

          if (user) {
            const saved = await isInWishlist(user.uid, item.id);
            setIsSaved(saved);
          }
        } else {
          setArtwork(null);
        }
      } catch (e) {
        console.error('Failed to load artwork detail:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [slug, user]);

  const handleToggleSave = async () => {
    if (!artwork) return;
    if (!user) {
      showToast('Please sign in to save artworks to your wishlist.', 'warning', {
        action: {
          label: 'Sign In',
          onClick: () => router.push(`/account/login?redirect=${encodeURIComponent(`/portfolio/${artwork.slug}`)}`),
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
      showToast(err?.message || 'Failed to update saved artwork.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading artwork details...
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
        <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow flex items-center justify-center">
          <div className="section-shell p-10 text-center max-w-md bg-white">
            <ShieldAlert className="mx-auto text-red-500 mb-4" size={40} />
            <h2 className="font-serif text-2xl mb-2">Artwork Not Found</h2>
            <p className="font-sans text-sm text-[var(--text-muted)] mb-6">
              The requested artwork could not be found. It may have been archived or removed.
            </p>
            <Link href="/portfolio" className="px-6 py-2.5 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors">
              Return to Portfolio
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const isAvailable = artwork.status === 'AVAILABLE' && artwork.availableForSale && artwork.inventoryQty > 0;
  const isAdded = isInCart(artwork.id);

  const handleAddToCart = () => {
    addToCart(artwork);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(artwork);
    router.push('/checkout');
  };

  const getStatusLabel = (status: Artwork['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available for Purchase';
      case 'SOLD':
        return 'Sold (Private Collection)';
      case 'COMMISSIONED':
        return 'Commissioned Work';
      case 'RESERVED':
        return 'Temporarily Reserved';
      case 'PORTFOLIO_ONLY':
      default:
        return 'Portfolio Exhibition Only';
    }
  };

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Back link */}
        <Link href="/portfolio" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors mb-10">
          <ArrowLeft size={14} />
          Back to Portfolio
        </Link>

        {/* Gallery & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Primary Image View */}
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)]">
              <Image
                src={artwork.images?.[activeImageIdx] || '/images/artist-studio.png'}
                alt={artwork.title}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {artwork.images && artwork.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {artwork.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0 cursor-pointer
                      ${activeImageIdx === idx ? 'border-[var(--accent-purple)] ring-2 ring-[var(--accent-purple)]/10' : 'border-[var(--border-soft)] opacity-70'}
                    `}
                  >
                    <Image src={img} alt={`${artwork.title} gallery thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information Panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] block mb-2 font-semibold">
                {getStatusLabel(artwork.status)}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-none text-[var(--accent-purple)] mb-3">
                {artwork.title}
              </h1>
              <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
                By {artwork.artist} • {artwork.year}
              </p>
            </div>

            {/* Specifications Card */}
            <div className="border-t border-b border-[var(--border-soft)] py-6 flex flex-col gap-4 font-mono text-xs tracking-wider">
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>Medium</span>
                <span className="text-[var(--foreground)] font-medium">{artwork.medium}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>Dimensions</span>
                <span className="text-[var(--foreground)] font-medium">{artwork.dimensions}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>Availability Status</span>
                <span className="text-[var(--foreground)] font-medium">{artwork.status.replace('_', ' ')}</span>
              </div>
              {artwork.status === 'AVAILABLE' && (
                <div className="flex justify-between items-baseline pt-4 border-t border-[var(--border-soft)]">
                  <span className="text-sm font-semibold">Price</span>
                  <span className="text-xl font-bold text-[var(--accent-orange)]">
                    ₦{artwork.price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Purchase & Wishlist CTA controls */}
            {isAvailable ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`py-3.5 rounded-full font-mono text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 cursor-pointer border transition-all
                      ${isAdded 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-white border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-[var(--foreground)]'
                      }
                    `}
                  >
                    {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
                    {isAdded ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="py-3.5 rounded-full font-mono text-xs uppercase tracking-widest font-semibold bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] shadow-sm transition-colors cursor-pointer"
                  >
                    Buy Artwork
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`w-full py-3 rounded-full font-mono text-xs uppercase tracking-widest font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer
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
                  <span>{isSaved ? 'Saved to Wishlist' : 'Save Artwork'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/contact?subject=Inquiry on Artwork: ${artwork.title}`}
                  className="w-full py-3.5 rounded-full bg-[var(--surface-soft)] text-[var(--accent-purple)] font-mono text-xs uppercase tracking-widest font-bold text-center border border-[var(--border-soft)] hover:bg-[var(--accent-purple)] hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle size={14} />
                  Enquire to Purchase
                </Link>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`w-full py-3 rounded-full font-mono text-xs uppercase tracking-widest font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer
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
                  <span>{isSaved ? 'Saved to Wishlist' : 'Save Artwork'}</span>
                </button>
                <p className="text-[10px] font-sans text-center text-[var(--text-muted)] leading-relaxed">
                  This work is sold or display only. We accept corporate commissions and residential requests similar to this piece.
                </p>
              </div>
            )}

            {/* Description/Story */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-xl text-[var(--foreground)] font-medium">The Story</h3>
              <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
                {artwork.description}
              </p>
              {artwork.story && (
                <div className="p-4 rounded-xl bg-[var(--surface-soft)]/20 border border-[var(--border-soft)] border-dashed mt-2 font-sans text-xs italic text-[var(--text-muted)]">
                  &ldquo;{artwork.story}&rdquo;
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Related artworks */}
        {related.length > 0 && (
          <section className="border-t border-[var(--border-soft)] pt-16">
            <h2 className="font-serif text-3xl mb-8 text-[var(--accent-purple)]">Related Artworks</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((rel) => (
                <Link
                  href={`/portfolio/${rel.slug}`}
                  key={rel.id}
                  className="section-shell p-4 bg-white/80 hover:[box-shadow:var(--shadow-soft)] transition-all duration-300 group flex flex-col gap-4"
                >
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                    <Image src={rel.images?.[0] || '/images/artist-studio.png'} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-serif text-base font-semibold truncate group-hover:text-[var(--accent-purple)] transition-colors">{rel.title}</h3>
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">{rel.year}</span>
                  </div>
                  <p className="font-sans text-xs text-[var(--text-muted)] line-clamp-1">{rel.medium}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
