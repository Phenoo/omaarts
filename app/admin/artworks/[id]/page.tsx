'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getArtwork, updateArtwork, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Category, ArtworkStatus, Artwork } from '@/lib/types';
import { validateArtworkInput, ValidationError } from '@/lib/validation';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditArtworkPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [artist, setArtist] = useState('Oma Achebe');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('Acrylic on Canvas');
  const [dimensions, setDimensions] = useState('Available on request');
  const [categoryId, setCategoryId] = useState('abstract');
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [inventoryQty, setInventoryQty] = useState(1);
  const [availableForSale, setAvailableForSale] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ArtworkStatus>('AVAILABLE');

  // File Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const catData = await getArtworkCategories();
        setCategories(catData);
        
        const art = await getArtwork(id);
        if (art) {
          setEditingArtwork(art);
          setTitle(art.title);
          setSlug(art.slug);
          setDescription(art.description);
          setStory(art.story || '');
          setArtist(art.artist);
          setYear(art.year);
          setMedium(art.medium);
          setDimensions(art.dimensions);
          setCategoryId(art.categoryId || (catData[0]?.id || 'abstract'));
          setImages(art.images || []);
          setPrice(art.price);
          setInventoryQty(art.inventoryQty);
          setAvailableForSale(art.availableForSale);
          setFeatured(art.featured);
          setStatus(art.status);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'artwork-temp';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError(`File ${file.name} is not an image.`);
        continue;
      }

      const fileRef = ref(storage, `artworks/${currentSlug}/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('File upload error:', error);
          setUploadError('Failed to upload image to Storage.');
          setUploadProgress(null);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImages((prev) => [...prev, downloadUrl]);
          setUploadProgress(null);
        }
      );
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const confirmMsg = "Are you sure you want to update this artwork?";
    if (!window.confirm(confirmMsg)) return;

    setSubmitError('');
    setValidationErrors([]);
    setIsSubmitting(true);

    const payload = {
      title,
      slug,
      description,
      story: story.trim() || undefined,
      artist,
      year,
      medium,
      dimensions,
      categoryId,
      images,
      price,
      currency: 'NGN' as const,
      inventoryQty: status === 'AVAILABLE' ? inventoryQty : 0,
      availableForSale: status === 'AVAILABLE' ? availableForSale : false,
      featured,
      status,
    };

    const errors = validateArtworkInput(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setSubmitError('Please upload at least one image of the artwork.');
      setIsSubmitting(false);
      return;
    }

    try {
      const adminUid = user?.uid || 'anonymous';
      await updateArtwork(id, payload, adminUid, 'Admin manual artwork update');
      router.push('/admin/artworks');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred while saving the artwork.');
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 text-[var(--foreground)] min-h-[50vh] justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Loading artwork...</span>
      </div>
    );
  }

  if (!editingArtwork) {
    return (
      <div className="flex flex-col gap-4 text-[var(--foreground)] items-center pt-10">
        <h2 className="font-serif text-2xl">Artwork not found</h2>
        <Link href="/admin/artworks" className="text-[var(--accent-purple)] hover:underline font-mono text-sm">
          Return to Artworks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)] max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-soft)] pb-6">
        <div>
          <Link href="/admin/artworks" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-purple)] font-mono uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Edit Artwork</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl w-full shadow-sm overflow-hidden border border-[var(--border-soft)]">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 text-sm">
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artwork Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Awka Heat Study"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-sans"
              />
              {getFieldError('title') && <span className="text-red-500 text-xs font-mono">{getFieldError('title')}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Slug (Permanent URL)</label>
              <input
                type="text"
                required
                disabled
                value={slug}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs disabled:bg-gray-50"
              />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Slug cannot be changed after creation.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artist</label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Year</label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Dimensions</label>
              <input
                type="text"
                required
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="40 x 50 inches / Custom"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Medium</label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="Acrylic on Canvas"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Price (NGN)</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Inventory Qty</label>
              <input
                type="number"
                min={0}
                required
                value={inventoryQty}
                onChange={(e) => setInventoryQty(parseInt(e.target.value, 10))}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArtworkStatus)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="SOLD">SOLD</option>
                <option value="PORTFOLIO_ONLY">PORTFOLIO_ONLY</option>
                <option value="RESERVED">RESERVED</option>
                <option value="COMMISSIONED">COMMISSIONED</option>
              </select>
            </div>
          </div>

          <div className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-4 bg-gray-50/50">
            <h4 className="font-serif text-lg text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-3 flex items-center gap-2">
              <ImageIcon size={20} />
              Artwork Images
            </h4>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-[var(--border-soft)] rounded-xl overflow-hidden group shadow-sm bg-white">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadProgress !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[var(--accent-purple)] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1 block">Uploading image: {uploadProgress}%</span>
              </div>
            )}

            {uploadError && <p className="text-red-500 text-xs font-mono">{uploadError}</p>}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-soft)] rounded-xl cursor-pointer hover:border-[var(--accent-purple)] transition-colors bg-white">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 font-mono text-xs uppercase tracking-wider gap-2">
                <Upload size={24} className="text-gray-400" />
                <span>Upload Images (Max 5MB)</span>
              </div>
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artwork Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artist Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Behind the canvas inspiration statement..."
              rows={3}
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-8 p-5 rounded-2xl bg-gray-50 border border-[var(--border-soft)] font-mono text-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={availableForSale}
                onChange={(e) => setAvailableForSale(e.target.checked)}
                className="rounded w-4 h-4 text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Available for Sale</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded w-4 h-4 text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Featured Collection</span>
            </label>
          </div>

          <div className="flex gap-4 justify-end border-t border-[var(--border-soft)] pt-8 mt-2">
            <Link
              href="/admin/artworks"
              className="px-6 py-3 border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-gray-50 rounded-full font-mono text-xs uppercase tracking-widest cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] rounded-full font-mono text-xs uppercase tracking-widest font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
