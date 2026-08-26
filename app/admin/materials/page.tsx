'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useState } from 'react';
import { Archive, Box, Loader2, Plus, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '@/lib/context/AdminAuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { archiveMaterial, createMaterial, getMaterials } from '@/lib/firebase/services/materials';
import { Material } from '@/lib/types';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function AdminMaterialsPage() {
  const { user } = useAdminAuth();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Art materials');
  const [price, setPrice] = useState('');
  const [inventoryQty, setInventoryQty] = useState('1');
  const [image, setImage] = useState('');

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setMaterials(await getMaterials());
    } catch (loadError) {
      console.error(loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadMaterials(); }, [loadMaterials]);

  const resetForm = () => {
    setTitle(''); setSlug(''); setDescription(''); setCategory('Art materials'); setPrice(''); setInventoryQty('1'); setImage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    const parsedQty = Number(inventoryQty);
    const cleanTitle = title.trim();
    const cleanSlug = slugify(slug || cleanTitle);
    if (!cleanTitle || !cleanSlug || !Number.isSafeInteger(parsedPrice) || parsedPrice <= 0 || !Number.isSafeInteger(parsedQty) || parsedQty < 0) {
      showToast('Enter a title, a valid price, and a non-negative stock quantity.', 'error');
      return;
    }

    setSaving(true);
    try {
      await createMaterial({
        title: cleanTitle,
        slug: cleanSlug,
        description: description.trim(),
        category: category.trim() || 'Art materials',
        images: [image.trim() || '/images/artist-studio.png'],
        price: parsedPrice,
        currency: 'NGN',
        inventoryQty: parsedQty,
        reservedQty: 0,
        availableForSale: true,
        featured: false,
        status: 'AVAILABLE',
      }, user?.uid || 'anonymous');
      showToast(`Material "${cleanTitle}" added to the shop.`, 'success');
      resetForm();
      await loadMaterials();
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'Failed to add material.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (material: Material) => {
    if (!window.confirm(`Archive "${material.title}"? It will no longer appear in the shop.`)) return;
    try {
      await archiveMaterial(material.id, user?.uid || 'anonymous');
      showToast('Material archived.', 'success');
      await loadMaterials();
    } catch (archiveError) {
      showToast(archiveError instanceof Error ? archiveError.message : 'Failed to archive material.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold">Shop Materials</h1>
        <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Add supplies and other creative goods that appear under the public shop page.</p>
      </div>

      <section className="bg-white border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6"><Plus size={18} className="text-[var(--accent-purple)]" /><h2 className="font-serif text-2xl">Add a material</h2></div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Name *<input value={title} onChange={(event) => { setTitle(event.target.value); setSlug(slugify(event.target.value)); }} placeholder="Premium acrylic set" className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-sans text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Slug *<input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="premium-acrylic-set" className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-mono text-xs normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Price (NGN) *<input type="number" min="1" step="1" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="15000" className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-mono text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Stock quantity *<input type="number" min="0" step="1" value={inventoryQty} onChange={(event) => setInventoryQty(event.target.value)} className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-mono text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Art materials" className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-sans text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Image URL <span className="font-sans normal-case tracking-normal text-[10px]">Optional; use a hosted image URL</span><input type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-sans text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <label className="md:col-span-2 flex flex-col gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="What is included and who it is for" className="border border-[var(--border-soft)] rounded-xl py-3 px-4 font-sans text-sm normal-case tracking-normal text-[var(--foreground)]" /></label>
          <div className="md:col-span-2 flex justify-end"><button type="submit" disabled={saving} className="px-6 py-3 rounded-full bg-[var(--accent-purple)] text-white hover:bg-[var(--accent-orange)] font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add to shop</button></div>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-2xl">Current materials</h2><button type="button" onClick={() => void loadMaterials()} className="p-2 rounded-full border border-[var(--border-soft)] bg-white" title="Refresh"><RefreshCw size={15} /></button></div>
        {loading ? <div className="py-12 text-center"><Loader2 className="mx-auto animate-spin text-[var(--accent-purple)]" /></div> : error ? <div className="bg-white border border-red-100 rounded-2xl p-8 text-center text-sm text-red-600">Could not load materials. <button type="button" onClick={() => void loadMaterials()} className="underline">Retry</button></div> : materials.length === 0 ? <div className="bg-white border border-dashed border-[var(--border-soft)] rounded-2xl p-12 text-center"><Box className="mx-auto mb-3 text-[var(--text-muted)]" /><p className="font-serif text-xl">No materials yet</p><p className="text-sm text-[var(--text-muted)] mt-1">Add the first item above and it will appear under the shop page.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{materials.map((material) => <article key={material.id} className="bg-white border border-[var(--border-soft)] rounded-2xl overflow-hidden"><img src={material.images[0] || '/images/artist-studio.png'} alt="" className="w-full aspect-[4/3] object-cover" /><div className="p-4"><div className="flex justify-between gap-3"><h3 className="font-serif text-xl">{material.title}</h3><span className="font-mono text-sm">₦{material.price.toLocaleString()}</span></div><p className="text-xs text-[var(--text-muted)] mt-1">{material.category} · Stock: {material.inventoryQty}</p><button type="button" onClick={() => void handleArchive(material)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-red-500 hover:text-red-700"><Archive size={13} /> Archive</button></div></article>)}</div>}
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';
