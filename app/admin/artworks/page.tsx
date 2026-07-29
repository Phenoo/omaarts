'use client';

import React, { useEffect, useState } from 'react';
import { getArtworks, createArtwork, updateArtwork, archiveArtwork, getArtworkCategories } from '@/lib/firebase/services/artworks';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Artwork, Category, ArtworkStatus } from '@/lib/types';
import { validateArtworkInput, ValidationError } from '@/lib/validation';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Palette, Plus, Edit, Archive, CheckCircle, XCircle, RefreshCw, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function AdminArtworksPage() {
  const { user } = useAdminAuth();

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [artist, setArtist] = useState('Oma Achebe');
  const [year, setYear] = useState('2026');
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

  const openCreateModal = () => {
    setEditingArtwork(null);
    setTitle('');
    setSlug('');
    setDescription('Part of the Interior Artworks collection by Oma Achebe. For details on provenance, dimensions, and pricing, please inquire directly.');
    setStory('');
    setArtist('Oma Achebe');
    setYear(new Date().getFullYear().toString());
    setMedium('Acrylic on Canvas');
    setDimensions('Available on request');
    setCategoryId(categories[0]?.id || 'abstract');
    setImages([]);
    setPrice(0);
    setInventoryQty(1);
    setAvailableForSale(true);
    setFeatured(false);
    setStatus('AVAILABLE');
    setValidationErrors([]);
    setSubmitError('');
    setUploadProgress(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  const openEditModal = (art: Artwork) => {
    setEditingArtwork(art);
    setTitle(art.title);
    setSlug(art.slug);
    setDescription(art.description);
    setStory(art.story || '');
    setArtist(art.artist);
    setYear(art.year);
    setMedium(art.medium);
    setDimensions(art.dimensions);
    setCategoryId(art.categoryId);
    setImages(art.images || []);
    setPrice(art.price);
    setInventoryQty(art.inventoryQty);
    setAvailableForSale(art.availableForSale);
    setFeatured(art.featured);
    setStatus(art.status);
    setValidationErrors([]);
    setSubmitError('');
    setUploadProgress(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Use current slug or generate temporary slug if empty
    const currentSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'artwork-temp';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Basic size validation (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      // Basic type validation
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
    setSubmitError('');
    setValidationErrors([]);

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
      inventoryQty: status === 'AVAILABLE' ? inventoryQty : 0, // set to 0 if sold/commissioned
      availableForSale: status === 'AVAILABLE' ? availableForSale : false,
      featured,
      status,
    };

    const errors = validateArtworkInput(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (images.length === 0) {
      setSubmitError('Please upload at least one image of the artwork.');
      return;
    }

    try {
      const adminUid = user?.uid || 'anonymous';
      if (editingArtwork) {
        await updateArtwork(editingArtwork.id, payload, adminUid, 'Admin manual artwork edit');
      } else {
        await createArtwork(payload, adminUid);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred while saving the artwork.');
    }
  };

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

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Top Banner controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Artworks Panel</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Manage e-commerce inventory, descriptions, dimensions, and image galleries.</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Add Artwork
        </button>
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
          <button onClick={openCreateModal} className="px-6 py-2.5 bg-[var(--accent-purple)] text-white font-mono text-xs uppercase tracking-wider hover:bg-[var(--accent-orange)] transition-colors rounded-full cursor-pointer">
            Create First Artwork
          </button>
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
                <button
                  onClick={() => openEditModal(art)}
                  className="p-2 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-gray-500 hover:text-[var(--accent-purple)] rounded-full hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer bg-white"
                  title="Edit Artwork"
                >
                  <Edit size={14} />
                </button>
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50">
              <h2 className="font-serif text-2xl text-[var(--accent-purple)] font-semibold">
                {editingArtwork ? `Edit: ${editingArtwork.title}` : 'Add New Artwork'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6 text-sm text-[var(--foreground)]">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-mono">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Artwork Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingArtwork) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                      }
                    }}
                    placeholder="E.g. Awka Heat Study"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans"
                  />
                  {getFieldError('title') && <span className="text-red-500 text-xs font-mono">{getFieldError('title')}</span>}
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Slug (Permanent URL)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingArtwork}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="awka-heat-study"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs disabled:bg-gray-50"
                  />
                  {getFieldError('slug') && <span className="text-red-500 text-xs font-mono">{getFieldError('slug')}</span>}
                </div>
              </div>

              {/* Artwork stats specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Artist</label>
                  <input
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Year</label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Dimensions</label>
                  <input
                    type="text"
                    required
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="40 x 50 inches / Custom"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Medium</label>
                  <input
                    type="text"
                    required
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    placeholder="Acrylic on Canvas / Mixed Media"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing, Quantity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Price (NGN)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Inventory Qty</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={inventoryQty}
                    onChange={(e) => setInventoryQty(parseInt(e.target.value, 10))}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArtworkStatus)}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="SOLD">SOLD</option>
                    <option value="PORTFOLIO_ONLY">PORTFOLIO_ONLY</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="COMMISSIONED">COMMISSIONED</option>
                  </select>
                </div>
              </div>

              {/* Image Uploader */}
              <div className="border border-[var(--border-soft)] rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="font-serif text-base text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-2 flex items-center gap-1.5">
                  <ImageIcon size={18} />
                  Artwork Images
                </h4>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-[var(--border-soft)] rounded-lg overflow-hidden group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                {uploadProgress !== null && (
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[var(--accent-purple)] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1 block">Uploading image: {uploadProgress}%</span>
                  </div>
                )}

                {uploadError && <p className="text-red-500 text-xs font-mono">{uploadError}</p>}

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[var(--border-soft)] rounded-xl cursor-pointer hover:border-[var(--accent-purple)] transition-colors bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 font-mono text-[10px] uppercase tracking-wider gap-1">
                      <Upload size={18} className="text-gray-400" />
                      <span>Upload Images (Max 5MB)</span>
                    </div>
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Description & Story */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Artwork Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Artist Story (Inspiration quote)</label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Behind the canvas inspiration statement..."
                  rows={2}
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-gray-50 border border-[var(--border-soft)] font-mono text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableForSale}
                    onChange={(e) => setAvailableForSale(e.target.checked)}
                    className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                  />
                  <span>Available for Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                  />
                  <span>Featured Collection</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end border-t border-[var(--border-soft)] pt-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-gray-50 rounded-full font-mono text-xs uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] rounded-full font-mono text-xs uppercase tracking-widest font-bold cursor-pointer"
                >
                  Save Artwork
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export const dynamic = 'force-dynamic';
