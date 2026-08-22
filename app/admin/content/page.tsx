'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FileText, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CMSContent {
  homeHeroTitle: string;
  homeHeroSub: string;
  aboutBio: string;
  aboutStory: string;
  shopAlert: string;
  footerTagline: string;
}

export default function AdminContentPage() {
  const [, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form states
  const [homeHeroTitle, setHomeHeroTitle] = useState('');
  const [homeHeroSub, setHomeHeroSub] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [shopAlert, setShopAlert] = useState('');
  const [footerTagline, setFooterTagline] = useState('');

  const loadContent = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'cms_content');
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as CMSContent;
        setContent(data);
        setHomeHeroTitle(data.homeHeroTitle);
        setHomeHeroSub(data.homeHeroSub);
        setAboutBio(data.aboutBio);
        setAboutStory(data.aboutStory);
        setShopAlert(data.shopAlert || '');
        setFooterTagline(data.footerTagline || '');
      } else {
        // Fallback default site copy
        const defaults: CMSContent = {
          homeHeroTitle: "Create. Sip. Connect.",
          homeHeroSub: "Creative experiences, original art, unforgettable moments.",
          aboutBio: "Artsy by Oma is a creative studio and art gallery founded by Oma Achebe, focused on sharing the beauty of contemporary painting, scented candle crafting, and design sessions.",
          aboutStory: "Oma Achebe is a Nigerian contemporary painter. Her work merges vibrant mixed media details with expressionist brushstrokes, creating visual spaces that represent identity, cultural memories, and structured chaos.",
          shopAlert: "All original canvas purchases come with signed certificates of authenticity.",
          footerTagline: "Artsy by Oma | Contemporary Art & Creative Studio in Nigeria."
        };
        setContent(defaults);
        setHomeHeroTitle(defaults.homeHeroTitle);
        setHomeHeroSub(defaults.homeHeroSub);
        setAboutBio(defaults.aboutBio);
        setAboutStory(defaults.aboutStory);
        setShopAlert(defaults.shopAlert);
        setFooterTagline(defaults.footerTagline);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const payload: CMSContent = {
        homeHeroTitle,
        homeHeroSub,
        aboutBio,
        aboutStory,
        shopAlert,
        footerTagline
      };

      const docRef = doc(db, 'settings', 'cms_content');
      await setDoc(docRef, payload, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save CMS contents.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-xs font-mono text-[var(--text-muted)] flex flex-col gap-2 items-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
        Configuring site content files...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--foreground)]">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold">CMS Page Content</h1>
          <p className="font-sans text-sm text-[var(--text-muted)] mt-1">Configure static copy, hero texts, biographies, and shop announcements.</p>
        </div>
        <button onClick={loadContent} className="p-2.5 rounded-full border hover:bg-gray-100 cursor-pointer" title="Sync Content">
          <RefreshCw size={16} />
        </button>
      </div>

      <form onSubmit={handleSaveCMS} className="bg-white border border-[var(--border-soft)] rounded-2xl p-6 shadow-sm flex flex-col gap-6 max-w-3xl">
        <h3 className="font-serif text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border-soft)] pb-3 flex items-center gap-1.5">
          <FileText size={18} />
          Edit Site Text Content
        </h3>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-mono flex items-center gap-2">
            <CheckCircle2 size={16} />
            Static site copies updated. Refresh client page to view updates.
          </div>
        )}

        {/* Home Hero Content */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold text-[var(--accent-purple)] border-b border-gray-100 pb-1.5">Homepage Hero Copy</h4>
          
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Homepage Title</label>
            <input
              type="text"
              required
              value={homeHeroTitle}
              onChange={(e) => setHomeHeroTitle(e.target.value)}
              className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Homepage Subtitle / Tagline</label>
            <input
              type="text"
              required
              value={homeHeroSub}
              onChange={(e) => setHomeHeroSub(e.target.value)}
              className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>
        </div>

        {/* About Page Content */}
        <div className="flex flex-col gap-4 border-t border-[var(--border-soft)] pt-6">
          <h4 className="font-serif text-base font-bold text-[var(--accent-purple)] border-b border-gray-100 pb-1.5">About Us Biography</h4>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Studio Short Intro</label>
            <textarea
              required
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              rows={3}
              className="border border-[var(--border-soft)] rounded-xl py-2.5 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Artist Story (Long biography)</label>
            <textarea
              required
              value={aboutStory}
              onChange={(e) => setAboutStory(e.target.value)}
              rows={4}
              className="border border-[var(--border-soft)] rounded-xl py-2.5 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Shop Content */}
        <div className="flex flex-col gap-4 border-t border-[var(--border-soft)] pt-6">
          <h4 className="font-serif text-base font-bold text-[var(--accent-purple)] border-b border-gray-100 pb-1.5">Shop Announcement Banner</h4>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Shop Alert Banner</label>
            <input
              type="text"
              value={shopAlert}
              onChange={(e) => setShopAlert(e.target.value)}
              className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>
        </div>

        {/* General Footer Tag */}
        <div className="flex flex-col gap-4 border-t border-[var(--border-soft)] pt-6">
          <h4 className="font-serif text-base font-bold text-[var(--accent-purple)] border-b border-gray-100 pb-1.5">Footer Statement</h4>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Footer Tagline</label>
            <input
              type="text"
              value={footerTagline}
              onChange={(e) => setFooterTagline(e.target.value)}
              className="border border-[var(--border-soft)] rounded-xl py-2 px-3 focus:outline-none focus:border-[var(--accent-purple)] font-sans text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-widest font-bold rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4"
        >
          <Save size={16} />
          Save CMS Configurations
        </button>

      </form>

    </div>
  );
}
export const dynamic = 'force-dynamic';
