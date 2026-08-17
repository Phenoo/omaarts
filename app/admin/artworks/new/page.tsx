'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createArtwork, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { Category, ArtworkStatus } from '@/lib/types';
import { validateArtworkInput, ValidationError } from '@/lib/validation';
import { imageStoragePath, storageErrorMessage, uploadImage, validateImageFile } from '@/lib/firebase/storage';
import { ArrowLeft, Upload, Image as ImageIcon, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddArtworkPage() {
  const { user } = useAdminAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('Part of the Interior Artworks collection by Oma Achebe. For details on provenance, dimensions, and pricing, please inquire directly.');
  const [story, setStory] = useState('');
  const [artist, setArtist] = useState('Oma Achebe');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [medium, setMedium] = useState('Acrylic on Canvas');
  const [dimensions, setDimensions] = useState('Available on request');
  const [categoryId, setCategoryId] = useState('abstract');
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState<number | string>('');
  const [inventoryQty, setInventoryQty] = useState<number | string>('');
  const [availableForSale, setAvailableForSale] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<ArtworkStatus>('AVAILABLE');

  // File Upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');

  // Validation & Submit states
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);
  const imagesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await getArtworkCategories();
        setCategories(catData);
        if (catData.length > 0) {
          setCategoryId(catData[0].id);
        }
      } catch (e) {
        console.error('Failed to load artwork categories:', e);
        showToast('Could not load artwork categories.', 'warning');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [showToast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'artwork-temp';

    if (!user) {
      const err = 'Your admin session is still loading. Please try again in a moment.';
      setUploadError(err);
      showToast(err, 'error');
      return;
    }

    for (const file of Array.from(files)) {
      const fileError = validateImageFile(file);
      if (fileError) {
        setUploadError(`${file.name}: ${fileError}`);
        showToast(`${file.name}: ${fileError}`, 'error');
        continue;
      }

      try {
        const downloadUrl = await uploadImage(file, imageStoragePath('artworks', currentSlug, file), setUploadProgress);
        setImages((prev) => [...prev, downloadUrl]);
        showToast(`Image uploaded: ${file.name}`, 'success');
      } catch (error) {
        console.error('File upload error:', error);
        const err = storageErrorMessage(error);
        setUploadError(err);
        showToast(`Upload failed: ${err}`, 'error');
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const scrollToFirstError = (errors: ValidationError[]) => {
    if (errors.length === 0) return;
    const firstField = errors[0].field;
    const el = document.getElementById(`field-${firstField}`) || formTopRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleStatusChange = (newStatus: ArtworkStatus) => {
    setStatus(newStatus);
    if (newStatus === 'PORTFOLIO_ONLY' || newStatus === 'SOLD' || newStatus === 'RESERVED' || newStatus === 'COMMISSIONED') {
      setAvailableForSale(false);
    } else if (newStatus === 'AVAILABLE') {
      setAvailableForSale(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitError('');
    setValidationErrors([]);

    const numPrice = (price === '' || price === undefined || price === null) ? 0 : Number(price);
    const cleanPrice = isNaN(numPrice) || numPrice < 0 ? 0 : numPrice;

    const numQty = (inventoryQty === '' || inventoryQty === undefined || inventoryQty === null)
      ? (status === 'AVAILABLE' && cleanPrice > 0 ? 1 : 0)
      : Number(inventoryQty);
    const cleanQty = isNaN(numQty) || numQty < 0 ? 0 : numQty;

    const cleanSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).trim();
    const isActuallyAvailable = status === 'AVAILABLE' && availableForSale && cleanPrice > 0;

    const payload = {
      title: title.trim(),
      slug: cleanSlug,
      description: description.trim(),
      story: story.trim() || '',
      artist: artist.trim(),
      year: year.trim(),
      medium: medium.trim(),
      dimensions: dimensions.trim(),
      categoryId,
      images,
      price: cleanPrice,
      currency: 'NGN' as const,
      inventoryQty: isActuallyAvailable ? (cleanQty > 0 ? cleanQty : 1) : 0,
      availableForSale: isActuallyAvailable,
      featured,
      status,
    };

    const errors = validateArtworkInput(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      const firstMsg = errors[0].message;
      setSubmitError(errors.map((err) => err.message).join(' • '));
      showToast(firstMsg, 'error');
      setTimeout(() => scrollToFirstError(errors), 100);
      return;
    }

    if (images.length === 0) {
      const imgError = 'Please upload at least one image of the artwork.';
      setSubmitError(imgError);
      showToast(imgError, 'error');
      if (imagesSectionRef.current) {
        imagesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const adminUid = user?.uid || 'anonymous';
      await createArtwork(payload, adminUid);
      showToast(`Artwork "${payload.title}" saved successfully!`, 'success');
      router.push('/admin/artworks');
    } catch (err: any) {
      console.error('Failed to create artwork:', err);
      const errMsg = err.message || 'An error occurred while saving the artwork.';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
      setIsSubmitting(false);
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-3 items-center">
        <Loader2 size={28} className="animate-spin text-[var(--accent-purple)]" />
        Loading artwork editor...
      </div>
    );
  }

  const isExhibitionMode = status === 'PORTFOLIO_ONLY' || !availableForSale || price === '' || Number(price) === 0;

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)] max-w-4xl mx-auto pb-16" ref={formTopRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-soft)] pb-6">
        <div>
          <Link href="/admin/artworks" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-purple)] font-mono uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft size={16} /> Back to Artworks
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Add New Artwork</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl w-full shadow-sm overflow-hidden border border-[var(--border-soft)]">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 text-sm" noValidate>
          
          {/* Top Error Alert Banner */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-mono flex items-start gap-3 animate-in fade-in" role="alert">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-1">Please fix the following issues:</p>
                <p className="leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5" id="field-title">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Artwork Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                }}
                placeholder="E.g. Awka Heat Study"
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-sans ${
                  getFieldError('title') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('title') && <span className="text-red-500 text-xs font-mono">{getFieldError('title')}</span>}
            </div>

            <div className="flex flex-col gap-1.5" id="field-slug">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Slug (Permanent URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="awka-heat-study"
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs ${
                  getFieldError('slug') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('slug') ? (
                <span className="text-red-500 text-xs font-mono">{getFieldError('slug')}</span>
              ) : (
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Lowercase letters, numbers, and hyphens only.</span>
              )}
            </div>
          </div>

          {/* Artist, Year & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5" id="field-artist">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Artist <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] ${
                  getFieldError('artist') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('artist') && <span className="text-red-500 text-xs font-mono">{getFieldError('artist')}</span>}
            </div>

            <div className="flex flex-col gap-1.5" id="field-year">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs ${
                  getFieldError('year') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('year') && <span className="text-red-500 text-xs font-mono">{getFieldError('year')}</span>}
            </div>

            <div className="flex flex-col gap-1.5" id="field-dimensions">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Dimensions <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="40 x 50 inches / Custom"
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] ${
                  getFieldError('dimensions') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('dimensions') && <span className="text-red-500 text-xs font-mono">{getFieldError('dimensions')}</span>}
            </div>
          </div>

          {/* Medium & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5" id="field-medium">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                Medium <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="Acrylic on Canvas"
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] ${
                  getFieldError('medium') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('medium') && <span className="text-red-500 text-xs font-mono">{getFieldError('medium')}</span>}
            </div>

            <div className="flex flex-col gap-1.5" id="field-categoryId">
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

          {/* Price, Inventory & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5" id="field-price">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold flex items-center justify-between">
                <span>Price (NGN)</span>
                <span className="text-[10px] font-normal text-[var(--accent-orange)]">Optional</span>
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Leave blank for Exhibition"
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs ${
                  getFieldError('price') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('price') ? (
                <span className="text-red-500 text-xs font-mono">{getFieldError('price')}</span>
              ) : (
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {price && Number(price) > 0 ? `₦${Number(price).toLocaleString()}` : 'Leave empty for "Price on request"'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5" id="field-inventoryQty">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold flex items-center justify-between">
                <span>Inventory Qty</span>
                <span className="text-[10px] font-normal text-gray-400">Optional</span>
              </label>
              <input
                type="number"
                min={0}
                value={inventoryQty}
                onChange={(e) => setInventoryQty(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder={status === 'AVAILABLE' && price !== '' && Number(price) > 0 ? '1' : '0'}
                className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs ${
                  getFieldError('inventoryQty') ? 'border-red-400 bg-red-50/20' : 'border-[var(--border-soft)]'
                }`}
              />
              {getFieldError('inventoryQty') ? (
                <span className="text-red-500 text-xs font-mono">{getFieldError('inventoryQty')}</span>
              ) : (
                <span className="text-[10px] font-mono text-[var(--text-muted)]">1 for original for sale, or 0 for display.</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5" id="field-status">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ArtworkStatus)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer font-sans"
              >
                <option value="AVAILABLE">AVAILABLE (For Sale)</option>
                <option value="PORTFOLIO_ONLY">PORTFOLIO_ONLY (Exhibition Only)</option>
                <option value="SOLD">SOLD (Private Collection)</option>
                <option value="RESERVED">RESERVED</option>
                <option value="COMMISSIONED">COMMISSIONED</option>
              </select>
            </div>
          </div>

          {/* Exhibition Mode Indicator Note */}
          {isExhibitionMode && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-150 text-purple-800 text-xs flex items-center gap-2.5 font-mono">
              <Sparkles size={16} className="text-[var(--accent-purple)] shrink-0" />
              <span>
                <strong>Exhibition / Showcase piece:</strong> This artwork will appear as &ldquo;Price on request&rdquo; with an enquiry button on the public gallery.
              </span>
            </div>
          )}

          {/* Artwork Images */}
          <div ref={imagesSectionRef} id="field-images" className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-4 bg-gray-50/50">
            <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
              <h4 className="font-serif text-lg text-[var(--accent-purple)] font-semibold flex items-center gap-2">
                <ImageIcon size={20} />
                Artwork Images <span className="text-red-500 text-sm">*</span>
              </h4>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
              </span>
            </div>

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
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
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
                <span>Upload Images (Max 5MB each)</span>
              </div>
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5" id="field-description">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artwork Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
            />
          </div>

          {/* Story */}
          <div className="flex flex-col gap-1.5" id="field-story">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Artist Story</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Behind the canvas inspiration statement..."
              rows={3}
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
            />
          </div>

          {/* Toggles */}
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

          {/* Bottom Error Notification Banner */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-mono flex items-start gap-3 animate-in fade-in" role="alert">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-0.5">Could not save artwork:</p>
                <p className="leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-[var(--border-soft)] pt-8 mt-2">
            <Link
              href="/admin/artworks"
              className="px-6 py-3 border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-gray-50 rounded-full font-mono text-xs uppercase tracking-widest cursor-pointer text-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] rounded-full font-mono text-xs uppercase tracking-widest font-bold cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Artwork...
                </>
              ) : (
                'Save Artwork'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
