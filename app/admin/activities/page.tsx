'use client';

import React, { useEffect, useState } from 'react';
import { getActivities, createActivity, updateActivity, archiveActivity } from '@/lib/firebase/services/activities';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { Activity, ActivityVariant, PricingModel } from '@/lib/types';
import { validateActivityInput, ValidationError } from '@/lib/validation';
import { Paintbrush, Plus, Edit, Archive, CheckCircle, XCircle, Star, Sparkles, RefreshCw } from 'lucide-react';

export default function AdminActivitiesPage() {
  const { user } = useAdminAuth();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
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
  
  // Custom arrays
  const [complimentaryItems, setComplimentaryItems] = useState<string[]>([]);
  const [newItemText, setNewItemText] = useState('');
  
  const [variants, setVariants] = useState<ActivityVariant[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(0);
  const [newVarDesc, setNewVarDesc] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');

  const loadActivities = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getActivities(false); // fetch all, including inactive
      setActivities(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const openCreateModal = () => {
    setEditingActivity(null);
    setName('');
    setSlug('');
    setDescription('');
    setShortDescription('');
    setBasePrice(0);
    setPricingModel('PER_PERSON');
    setPriceUnit('person');
    setDuration('2 hours');
    setComplimentaryText('Complimentary Drinks, Music and Games');
    setCategory('Painting');
    setSortOrder(activities.length + 1);
    setActive(true);
    setFeatured(false);
    setBookingEnabled(true);
    setComplimentaryItems(['1 Complimentary Drink', 'Art Supplies']);
    setVariants([]);
    setValidationErrors([]);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingActivity(act);
    setName(act.name);
    setSlug(act.slug);
    setDescription(act.description);
    setShortDescription(act.shortDescription || '');
    setBasePrice(act.basePrice);
    setPricingModel(act.pricingModel);
    setPriceUnit(act.priceUnit || '');
    setDuration(act.duration);
    setComplimentaryText(act.complimentaryText || '');
    setCategory(act.category);
    setSortOrder(act.sortOrder);
    setActive(act.active);
    setFeatured(act.featured);
    setBookingEnabled(act.bookingEnabled);
    setComplimentaryItems(act.complimentaryItems || []);
    setVariants(act.variants || []);
    setValidationErrors([]);
    setSubmitError('');
    setIsModalOpen(true);
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
    setSubmitError('');
    setValidationErrors([]);

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
      images: editingActivity ? editingActivity.images : ['/images/artist-studio.png']
    };

    const errors = validateActivityInput(payload);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const adminUid = user?.uid || 'anonymous';
      if (editingActivity) {
        // Update
        await updateActivity(editingActivity.id, payload, adminUid, 'Admin manual activity update');
      } else {
        // Create
        await createActivity(payload, adminUid);
      }
      setIsModalOpen(false);
      loadActivities();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred while saving the activity.');
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this activity? Archiving keeps historical reports safe but hides the experience from the catalog.')) {
      try {
        const adminUid = user?.uid || 'anonymous';
        await archiveActivity(id, adminUid);
        loadActivities();
      } catch (err) {
        console.error(err);
        alert('Failed to archive activity.');
      }
    }
  };

  const getFieldError = (field: string) => {
    return validationErrors.find((err) => err.field === field)?.message;
  };

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">Activities Panel</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Manage packages, variants, pricing, and availability states.</p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] transition-colors font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
          Loading activities...
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-100 rounded-2xl bg-white max-w-sm mx-auto flex flex-col gap-4 items-center">
          <p className="text-red-500 font-mono text-xs">Failed to connect to database.</p>
          <button onClick={loadActivities} className="px-5 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase hover:bg-[var(--accent-orange)] transition-colors flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border-soft)] bg-white rounded-2xl">
          <Paintbrush className="mx-auto text-[var(--text-muted)] mb-3" size={32} />
          <h3 className="font-serif text-lg">No activities logged</h3>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1 mb-6">Database activities are empty. Trigger seeds or add manually.</p>
          <button onClick={openCreateModal} className="px-6 py-2.5 bg-[var(--accent-purple)] text-white font-mono text-xs uppercase tracking-wider hover:bg-[var(--accent-orange)] transition-colors rounded-full cursor-pointer">
            Create First Activity
          </button>
        </div>
      ) : (
        /* Table of activities */
        <div className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-[var(--border-soft)] font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-gray-50/50">
                  <th className="p-4 font-semibold">Activity</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Base Price</th>
                  <th className="p-4 font-semibold">Pricing Model</th>
                  <th className="p-4 font-semibold">Booking Status</th>
                  <th className="p-4 font-semibold">Active Catalog</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/40">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-serif font-bold text-base text-[var(--foreground)]">{act.name}</span>
                        <span className="font-mono text-[9px] text-[var(--text-muted)]">Slug: {act.slug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold">{act.category}</td>
                    <td className="p-4 font-mono text-xs font-bold text-[var(--foreground)]">
                      ₦{act.basePrice.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                      {act.pricingModel}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold
                        ${act.bookingEnabled ? 'text-green-700' : 'text-amber-700'}
                      `}>
                        {act.bookingEnabled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {act.bookingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold
                        ${act.active ? 'text-green-700' : 'text-gray-400'}
                      `}>
                        {act.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {act.active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(act)}
                          className="p-2 border border-[var(--border-soft)] hover:border-[var(--accent-purple)] text-gray-500 hover:text-[var(--accent-purple)] rounded-full hover:bg-[var(--surface-soft)]/20 transition-all cursor-pointer"
                          title="Edit Activity"
                        >
                          <Edit size={14} />
                        </button>
                        {act.active && (
                          <button
                            onClick={() => handleArchive(act.id)}
                            className="p-2 border border-red-150 hover:border-red-500 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                            title="Archive Activity"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--border-soft)] flex justify-between items-center bg-gray-50">
              <h2 className="font-serif text-2xl text-[var(--accent-purple)] font-semibold">
                {editingActivity ? `Edit: ${editingActivity.name}` : 'Add New Activity'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 cursor-pointer">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6 text-sm text-[var(--foreground)]">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-mono">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Activity Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingActivity) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                      }
                    }}
                    placeholder="E.g. Cap Painting"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans"
                  />
                  {getFieldError('name') && <span className="text-red-500 text-xs font-mono">{getFieldError('name')}</span>}
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Slug (Permanent URL)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingActivity}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cap-painting"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs disabled:bg-gray-50"
                  />
                  {getFieldError('slug') && <span className="text-red-500 text-xs font-mono">{getFieldError('slug')}</span>}
                </div>
              </div>

              {/* Descriptions */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Short Description (Cards snippet)</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="E.g. Custom design and paint wearable baseball caps."
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Full Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete overview of what is expected, materials provided, and flow..."
                  rows={3}
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] resize-none"
                />
                {getFieldError('description') && <span className="text-red-500 text-xs font-mono">{getFieldError('description')}</span>}
              </div>

              {/* Sizing & Pricing Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Base Price */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Base Price (NGN)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                  />
                  {getFieldError('basePrice') && <span className="text-red-500 text-xs font-mono">{getFieldError('basePrice')}</span>}
                </div>

                {/* Pricing Model */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Pricing Model</label>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
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

                {/* Price Unit */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Price Unit (Label suffix)</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    placeholder="person / hour / session"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                </div>
              </div>

              {/* Duration & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Duration</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2 hours / 30 mins"
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                  />
                  {getFieldError('duration') && <span className="text-red-500 text-xs font-mono">{getFieldError('duration')}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                  >
                    <option>Painting</option>
                    <option>Crafts</option>
                    <option>Body Art</option>
                    <option>Entertainment</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Sorting Weight</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                    className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Custom complimentary text */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">Complimentary Highlight Text</label>
                <input
                  type="text"
                  value={complimentaryText}
                  onChange={(e) => setComplimentaryText(e.target.value)}
                  placeholder="Complimentary Drinks, Music and Games"
                  className="w-full border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-gray-50 border border-[var(--border-soft)] font-mono text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                  />
                  <span>Active Catalog</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                  />
                  <span>Featured Home</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingEnabled}
                    onChange={(e) => setBookingEnabled(e.target.checked)}
                    className="rounded text-[var(--accent-purple)] focus:ring-[var(--accent-purple)]"
                  />
                  <span>Booking Enabled</span>
                </label>
              </div>

              {/* Pricing Variants list manager */}
              {pricingModel === 'VARIANT' && (
                <div className="border border-[var(--border-soft)] rounded-2xl p-4 flex flex-col gap-4">
                  <h4 className="font-serif text-base text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-2">
                    Pricing Variants
                  </h4>
                  
                  {/* List of current variants */}
                  {variants.length === 0 ? (
                    <p className="font-sans text-xs text-[var(--text-muted)] italic">No variants added yet. Please add options below.</p>
                  ) : (
                    <div className="flex flex-col gap-2 font-mono text-xs">
                      {variants.map((v, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 rounded-lg border bg-gray-50/50">
                          <div>
                            <span className="font-bold text-[var(--foreground)]">{v.name}</span>
                            {v.description && <span className="block text-[10px] text-[var(--text-muted)] normal-case font-sans mt-0.5">{v.description}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[var(--accent-orange)]">₦{v.price.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              className="text-red-500 hover:text-red-700 font-sans font-bold cursor-pointer text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add variant row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--border-soft)] pt-4 mt-2">
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. Single)"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Price (NGN)"
                      value={newVarPrice}
                      onChange={(e) => setNewVarPrice(parseFloat(e.target.value))}
                      className="border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={addVariant}
                      className="py-1.5 bg-gray-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider font-semibold hover:bg-gray-700 cursor-pointer"
                    >
                      Add option
                    </button>
                  </div>
                </div>
              )}

              {/* Complimentary items list manager */}
              <div className="border border-[var(--border-soft)] rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="font-serif text-base text-[var(--accent-purple)] font-semibold border-b border-[var(--border-soft)] pb-2">
                  Complimentary Extras list
                </h4>
                
                {complimentaryItems.length === 0 ? (
                  <p className="font-sans text-xs text-[var(--text-muted)] italic">No items logged.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {complimentaryItems.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-[var(--surface-soft)] text-[var(--accent-purple)] px-3 py-1 rounded-full font-mono text-[10px]">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeComplimentaryItem(idx)}
                          className="hover:text-red-500 font-bold rotate-45 cursor-pointer font-mono"
                        >
                          +
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Item (e.g. 1 Complimentary Drink)"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="flex-grow border border-[var(--border-soft)] rounded-xl py-1.5 px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addComplimentaryItem}
                    className="px-4 py-1.5 bg-gray-800 text-white rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-gray-700 cursor-pointer"
                  >
                    Add Extra
                  </button>
                </div>
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
                  Save Activity
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
