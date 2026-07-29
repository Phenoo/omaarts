'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getArtworks, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { Artwork, Category } from '@/lib/types';
import { useCart } from '@/lib/context/CartContext';
import { Search, SlidersHorizontal, RefreshCw, ShoppingCart, ArrowUpDown } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ShopPage() {
  const { addToCart, isInCart } = useCart();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'sold'>('all');

  const loadShopData = async () => {
    setLoading(true);
    setError(false);
    try {
      const artData = await getArtworks();
      // Only display artworks that are not ARCHIVED and not PORTFOLIO_ONLY for shop listings, unless requested
      const shopItems = artData.filter(a => a.status !== 'PORTFOLIO_ONLY');
      setArtworks(shopItems);
      const catData = await getArtworkCategories();
      setCategories(catData);
    } catch (e) {
      console.error('Failed to load shop items:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  // Filter & sort logic on client side
  let filtered = artworks.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.medium.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || art.categoryId === selectedCategory;
    
    const matchesAvail = filterAvailability === 'all' ||
      (filterAvailability === 'available' && art.status === 'AVAILABLE') ||
      (filterAvailability === 'sold' && art.status === 'SOLD');

    return matchesSearch && matchesCat && matchesAvail;
  });

  if (priceSort === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const getStatusBadge = (art: Artwork) => {
    if (art.status === 'SOLD') {
      return (
        <span className="absolute top-3 left-3 bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold shadow-sm">
          Sold
        </span>
      );
    }
    if (art.status === 'RESERVED') {
      return (
        <span className="absolute top-3 left-3 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold shadow-sm">
          Reserved
        </span>
      );
    }
    if (art.status === 'COMMISSIONED') {
      return (
        <span className="absolute top-3 left-3 bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold shadow-sm">
          Commissioned
        </span>
      );
    }
    return (
      <span className="absolute top-3 left-3 bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold shadow-sm">
        For Sale
      </span>
    );
  };

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-[var(--border-soft)] pb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-2">Original Artworks</p>
            <h1 className="font-serif text-6xl md:text-8xl text-[var(--accent-purple)] tracking-tight leading-[0.9]">
              Art Shop
            </h1>
          </div>
          <div className="font-mono text-sm uppercase tracking-widest hidden md:block text-[var(--text-muted)]">
            {filtered.length} Works Available
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col xl:flex-row gap-5 justify-between items-stretch xl:items-center mb-12 bg-white/50 border border-[var(--border-soft)] p-4 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search art collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border-soft)] rounded-xl text-xs focus:outline-none focus:border-[var(--accent-purple)] font-sans"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center bg-white border border-[var(--border-soft)] rounded-xl px-3 py-2">
              <SlidersHorizontal size={14} className="text-gray-400 mr-2 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Sort & Availability Options */}
            <div className="flex gap-2">
              <div className="flex items-center bg-white border border-[var(--border-soft)] rounded-xl px-3 py-2 flex-grow">
                <ArrowUpDown size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  className="w-full bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="none">Sort by Price</option>
                  <option value="asc">Low to High</option>
                  <option value="desc">High to Low</option>
                </select>
              </div>

              <div className="flex items-center bg-white border border-[var(--border-soft)] rounded-xl px-3 py-2 flex-grow">
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value as any)}
                  className="w-full bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="all">All Availability</option>
                  <option value="available">For Sale Only</option>
                  <option value="sold">Sold Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="section-shell p-5 flex flex-col gap-4 animate-pulse bg-white/50">
                <div className="aspect-[3/4] w-full bg-gray-200 rounded-xl" />
                <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
                <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="section-shell p-12 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <p className="text-red-500 font-mono text-sm">Failed to connect to the database.</p>
            <button
              onClick={loadShopData}
              className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="section-shell p-16 text-center max-w-md mx-auto my-12 bg-white flex flex-col gap-4 items-center">
            <h2 className="font-serif text-2xl">No artwork found</h2>
            <p className="font-sans text-sm text-[var(--text-muted)]">No active items are currently matching your shop search filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceSort('none');
                setFilterAvailability('all');
              }}
              className="px-6 py-2 border border-[var(--accent-purple)] text-[var(--accent-purple)] rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-purple)] hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Artworks List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filtered.map((art) => {
              const inCart = isInCart(art.id);
              const isAvailable = art.status === 'AVAILABLE' && art.availableForSale && art.inventoryQty > 0;

              return (
                <div key={art.id} className="group flex flex-col gap-4">
                  <div className="aspect-[3/4] relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)]">
                    <Link href={`/portfolio/${art.slug}`} className="block relative w-full h-full">
                      <Image 
                        src={art.images && art.images[0] ? art.images[0] : '/images/artist-studio.png'} 
                        alt={art.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    
                    {/* Status Badge */}
                    {getStatusBadge(art)}

                    {/* Quick Checkout Overlay */}
                    {isAvailable && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => addToCart(art)}
                          disabled={inCart}
                          className={`p-2.5 rounded-full border shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110
                            ${inCart 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'bg-white border-[var(--border-soft)] text-[var(--foreground)] hover:text-[var(--accent-purple)]'
                            }
                          `}
                          title={inCart ? 'Item in cart' : 'Add to Cart'}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline border-t border-[var(--border-soft)] pt-4 group-hover:border-[var(--accent-purple)] transition-colors">
                    <h3 className="font-serif text-2xl group-hover:text-[var(--accent-purple)] transition-colors truncate pr-4">
                      <Link href={`/portfolio/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>
                    <span className="font-mono text-sm font-semibold flex-shrink-0">
                      ₦{art.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center -mt-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                      {art.medium}
                    </span>
                    <Link 
                      href={`/portfolio/${art.slug}`} 
                      className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent-orange)] hover:text-[var(--accent-purple)] transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
