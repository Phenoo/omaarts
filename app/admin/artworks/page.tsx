'use client';

import React, { useEffect, useState } from 'react';
import { getArtworks, createArtwork, updateArtwork, archiveArtwork, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Artwork, Category, ArtworkStatus } from '@/lib/types';
import { validateArtworkInput, ValidationError } from '@/lib/validation';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Palette, Plus, Edit, Archive, CheckCircle, XCircle, RefreshCw, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminArtworksPage() {
  const { user } = useAdminAuth();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);



  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const artData = await getArtworks();
      setArtworks(artData);
      const catData = await getArtworkCategories();
      setCategories(catData);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);





  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this artwork? This will remove it from the catalog but preserve invoice purchase history.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await archiveArtwork(id, adminUid);
        loadData();
      } catch (err) {
        console.error(err);
        alert('Failed to archive artwork.');
      }
    }
  };



  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Top Banner controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Artworks Panel</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Manage e-commerce inventory, descriptions, dimensions, and image galleries.</p>
        </div>
        
        <Link
          href="/admin/artworks/new"
          className="px-5 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Add Artwork
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading art collection...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-100 rounded-2xl bg-white max-w-sm mx-auto flex flex-col gap-4 items-center">
          <p className="text-red-500 font-mono text-xs">Failed to connect to database.</p>
          <button onClick={loadData} className="px-5 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Palette className="mx-auto text-[var(--text-muted)] mb-3" size={32} />
          <h3 className="font-serif text-lg">No artworks in gallery</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1 mb-6">Database artworks are currently empty.</p>
          <Link href="/admin/artworks/new" className="inline-block px-6 py-2.5 bg-[var(--accent-purple)] text-white font-mono text-xs uppercase tracking-wider hover:bg-[var(--accent-orange)] transition-colors rounded-full cursor-pointer">
            Create First Artwork
          </Link>
        </div>
      ) : (
        /* Grid of artwork items */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art) => (
            <article key={art.id} className="bg-white border border-[var(--border-soft)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
              {/* Thumbnail / Header */}
              <div>
                <div className="relative aspect-[4/3] bg-gray-100 border-b border-[var(--border-soft)]">
                  <img
                    src={art.images?.[0] || '/images/artist-studio.png'}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider font-semibold border shadow-sm bg-white text-gray-800 border-gray-200`}>
                      {art.status}
                    </span>
                    {art.featured && (
                      <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider font-semibold shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-serif font-bold text-lg text-[var(--foreground)] truncate pr-4">{art.title}</h3>
                    <span className="font-mono text-xs text-[var(--text-muted)]">{art.year}</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--accent-orange)]">{art.medium}</span>
                  <div className="font-sans text-xs text-[var(--text-muted)] mt-1.5 flex justify-between border-t border-gray-50 pt-2">
                    <span>Stock: {art.inventoryQty}</span>
                    <span>₦{art.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex gap-2 justify-end">
                <Link
                  href={`/admin/artworks/${art.id}`}
                  className="p-2 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-gray-500 hover:text-[var(--accent-purple)] rounded-full hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer bg-white"
                  title="Edit Artwork"
                >
                  <Edit size={14} />
                </Link>
                {art.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleArchive(art.id)}
                    className="p-2 border border-red-150 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all cursor-pointer bg-white"
                    title="Archive Artwork"
                  >
                    <Archive size={14} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}



    </div>
  );
}
export const dynamic = 'force-dynamic';
