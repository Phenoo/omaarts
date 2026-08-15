'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createActivity } from '@/lib/firebase/services/activities';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { imageStoragePath, storageErrorMessage, uploadImage, validateImageFile } from '@/lib/firebase/storage';
import { ActivityVariant, PricingModel } from '@/lib/types';
import { validateActivityInput, ValidationError } from '@/lib/validation';
import { ArrowLeft, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AddActivityPage() {
  const { user } = useAdminAuth();
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [pricingModel, setPricingModel] = useState<PricingModel>('PER_PERSON');
  const [priceUnit, setPriceUnit] = useState('person');
  const [duration, setDuration] = useState('2 hours');
  const [complimentaryText, setComplimentaryText] = useState('Complimentary Drinks, Music and Games');
  const [category, setCategory] = useState('Painting');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');
  
  // Custom arrays
  const [complimentaryItems, setComplimentaryItems] = useState<string[]>(['1 Complimentary Drink', 'Art Supplies']);
  const [newItemText, setNewItemText] = useState('');
  
  const [variants, setVariants] = useState<ActivityVariant[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(0);
  const [newVarDesc, setNewVarDesc] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'activity-temp';

    if (!user) {
      setUploadError('Your admin session is still loading. Please try again in a moment.');
      return;
    }

    for (const file of Array.from(files)) {
      const fileError = validateImageFile(file);
      if (fileError) {
        setUploadError(`${file.name}: ${fileError}`);
        continue;
      }

      try {
        const downloadUrl = await uploadImage(file, imageStoragePath('activities', currentSlug, file), setUploadProgress);
        setImages((prev) => [...prev, downloadUrl]);
      } catch (error) {
        console.error('File upload error:', error);
        setUploadError(storageErrorMessage(error));
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Add Item to complimentary list
  const addComplimentaryItem = () => {
    if (newItemText.trim()) {
      setComplimentaryItems([...complimentaryItems, newItemText.trim()]);
      setNewItemText('');
    }
  };

  const removeComplimentaryItem = (idx: number) => {
    setComplimentaryItems(complimentaryItems.filter((_, i) => i !== idx));
  };

  // Add Variant
  const addVariant = () => {
    if (newVarName.trim() && newVarPrice >= 0) {
      const newVar: ActivityVariant = {
        id: newVarName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: newVarName.trim(),
        price: newVarPrice,
        description: newVarDesc.trim() || undefined
      };
      setVariants([...variants, newVar]);
      setNewVarName('');
      setNewVarPrice(0);
      setNewVarDesc('');
    }
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm("Are you sure you want to add this new activity?")) return;

    setSubmitError('');
    setValidationErrors([]);
    setIsSubmitting(true);

    const finalImages = images.length > 0 ? images : ['/images/studio/IMG_0890.png'];

    const payload = {
      name,
      slug,
      description,
      shortDescription,
      basePrice,
      pricingModel,
      variants,
      priceUnit,
      duration,
      complimentaryItems,
      category,
      active,
      featured,
      bookingEnabled,
      sortOrder,
      complimentaryText,
      currency: 'NGN' as const,
      images: finalImages
    };

    const errors = validateActivityInput(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const adminUid = user?.uid || 'anonymous';
      await createActivity(payload, adminUid);
      router.push('/admin/activities');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred while saving the activity.');
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)] max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-soft)] pb-6">
        <div>
          <Link href="/admin/activities" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent-purple)] font-mono uppercase tracking-widest transition-colors mb-2">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Add New Activity</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl w-full shadow-sm overflow-hidden border border-[var(--border-soft)]">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 text-sm">
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono">
              {submitError}
            </div>
          )}

          {/* Image Upload Block */}
          <div className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-4 bg-gray-50/50">
            <h4 className="font-serif text-lg text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-3 flex items-center gap-2">
              <ImageIcon size={20} />
              Activity Images
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
                <span>Upload Activity Images (Max 10MB)</span>
              </div>
              <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Activity Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                }}
                placeholder="E.g. Cap Painting"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-sans"
              />
              {getFieldError('name') && <span className="text-red-500 text-xs font-mono">{getFieldError('name')}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Slug (Permanent URL)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cap-painting"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
              {getFieldError('slug') && <span className="text-red-500 text-xs font-mono">{getFieldError('slug')}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Short Description (Cards snippet)</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="E.g. Custom design and paint wearable baseball caps."
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Full Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete overview of what is expected, materials provided, and flow..."
              rows={4}
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
            />
            {getFieldError('description') && <span className="text-red-500 text-xs font-mono">{getFieldError('description')}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Base Price (NGN)</label>
              <input
                type="number"
                min={0}
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
              {getFieldError('basePrice') && <span className="text-red-500 text-xs font-mono">{getFieldError('basePrice')}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Pricing Model</label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
              >
                <option value="FIXED">FIXED</option>
                <option value="PER_PERSON">PER_PERSON</option>
                <option value="PER_HOUR">PER_HOUR</option>
                <option value="TIERED">TIERED (Karaoke)</option>
                <option value="VARIANT">VARIANT (Options)</option>
                <option value="BOOKING_ONLY">BOOKING_ONLY</option>
                <option value="CUSTOM_QUOTE">CUSTOM_QUOTE</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Price Unit (Label suffix)</label>
              <input
                type="text"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                placeholder="person / hour / session"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2 hours / 30 mins"
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
              />
              {getFieldError('duration') && <span className="text-red-500 text-xs font-mono">{getFieldError('duration')}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
              >
                <option>Painting</option>
                <option>Crafts</option>
                <option>Body Art</option>
                <option>Entertainment</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Sorting Weight</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">Complimentary Highlight Text</label>
            <input
              type="text"
              value={complimentaryText}
              onChange={(e) => setComplimentaryText(e.target.value)}
              placeholder="Complimentary Drinks, Music and Games"
              className="w-full border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="flex flex-wrap gap-8 p-5 rounded-2xl bg-gray-50 border border-[var(--border-soft)] font-mono text-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded w-4 h-4 text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Active Catalog</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded w-4 h-4 text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Featured Home</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingEnabled}
                onChange={(e) => setBookingEnabled(e.target.checked)}
                className="rounded w-4 h-4 text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
              />
              <span>Booking Enabled</span>
            </label>
          </div>

          {pricingModel === 'VARIANT' && (
            <div className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-5">
              <h4 className="font-serif text-lg text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-3">
                Pricing Variants
              </h4>
              
              {variants.length === 0 ? (
                <p className="font-sans text-sm text-[var(--text-muted)] italic">No variants added yet. Please add options below.</p>
              ) : (
                <div className="flex flex-col gap-3 font-mono text-sm">
                  {variants.map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl border bg-gray-50/50">
                      <div>
                        <span className="font-bold text-[var(--foreground)] text-base">{v.name}</span>
                        {v.description && <span className="block text-xs text-[var(--text-muted)] normal-case font-sans mt-1">{v.description}</span>}
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-semibold text-lg text-[var(--accent-orange)]">₦{v.price.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-red-500 hover:text-red-700 font-sans font-bold cursor-pointer text-sm bg-red-50 px-3 py-1.5 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-[var(--border-soft)] pt-5 mt-2">
                <input
                  type="text"
                  placeholder="Variant Name (e.g. Single)"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  className="sm:col-span-4 border border-[var(--border-soft)] rounded-xl py-2.5 px-4 text-sm"
                />
                <input
                  type="number"
                  placeholder="Price (NGN)"
                  value={newVarPrice}
                  onChange={(e) => setNewVarPrice(parseFloat(e.target.value))}
                  className="sm:col-span-4 border border-[var(--border-soft)] rounded-xl py-2.5 px-4 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="sm:col-span-4 py-2.5 bg-gray-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider font-semibold hover:bg-gray-700 cursor-pointer"
                >
                  Add option
                </button>
              </div>
            </div>
          )}

          <div className="border border-[var(--border-soft)] rounded-2xl p-5 flex flex-col gap-5">
            <h4 className="font-serif text-lg text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-3">
              Complimentary Extras list
            </h4>
            
            {complimentaryItems.length === 0 ? (
              <p className="font-sans text-sm text-[var(--text-muted)] italic">No items logged.</p>
            ) : (
              <div className="flex flex-wrap gap-3 text-sm">
                {complimentaryItems.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 bg-[var(--surface-soft)] text-[var(--accent-purple)] px-4 py-1.5 rounded-full font-mono text-xs">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeComplimentaryItem(idx)}
                      className="hover:text-red-500 font-bold rotate-45 cursor-pointer font-mono text-base ml-1"
                    >
                      +
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Item (e.g. 1 Complimentary Drink)"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-grow border border-[var(--border-soft)] rounded-xl py-2.5 px-4 text-sm"
              />
              <button
                type="button"
                onClick={addComplimentaryItem}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-gray-700 cursor-pointer"
              >
                Add Extra
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-end border-t border-[var(--border-soft)] pt-8 mt-2">
            <Link
              href="/admin/activities"
              className="px-6 py-3 border border-[var(--border-soft)] text-[var(--text-muted)] hover:bg-gray-50 rounded-full font-mono text-xs uppercase tracking-widest cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] rounded-full font-mono text-xs uppercase tracking-widest font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
