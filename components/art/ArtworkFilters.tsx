'use client';

import { useMemo, useState } from 'react';
import ArtworkCard from './ArtworkCard';
import { PublicArtwork } from '@/lib/public-data';

export default function ArtworkFilters({ artworks }: { artworks: PublicArtwork[] }) {
  const [availability, setAvailability] = useState('all');
  const [collection, setCollection] = useState('all');
  const [medium, setMedium] = useState('all');
  const [year, setYear] = useState('all');

  const collections = [...new Set(artworks.map((artwork) => artwork.categoryId).filter(Boolean))];
  const mediums = [...new Set(artworks.map((artwork) => artwork.medium).filter(Boolean))];
  const years = [...new Set(artworks.map((artwork) => artwork.year).filter(Boolean))];

  const filtered = useMemo(() => artworks.filter((artwork) => {
    const matchesAvailability = availability === 'all' ||
      (availability === 'available' && artwork.status === 'AVAILABLE') ||
      (availability === 'portfolio' && artwork.status !== 'AVAILABLE');
    return matchesAvailability &&
      (collection === 'all' || artwork.categoryId === collection) &&
      (medium === 'all' || artwork.medium === medium) &&
      (year === 'all' || artwork.year === year);
  }), [artworks, availability, collection, medium, year]);

  const selectClass = 'filter-select';

  return (
    <>
      <div className="filter-bar" aria-label="Artwork filters">
        <label>Availability<select className={selectClass} value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">All works</option><option value="available">Available</option><option value="portfolio">Portfolio</option></select></label>
        {collections.length > 1 && <label>Collection<select className={selectClass} value={collection} onChange={(event) => setCollection(event.target.value)}><option value="all">All collections</option>{collections.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}</select></label>}
        {mediums.length > 1 && <label>Medium<select className={selectClass} value={medium} onChange={(event) => setMedium(event.target.value)}><option value="all">All media</option>{mediums.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
        {years.length > 1 && <label>Year<select className={selectClass} value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All years</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <h2 className="font-serif text-3xl">No works match those filters.</h2>
          <p>Try another combination or return to the complete portfolio.</p>
          <button type="button" className="button button--outline" onClick={() => { setAvailability('all'); setCollection('all'); setMedium('all'); setYear('all'); }}>Reset filters</button>
        </div>
      )}
    </>
  );
}
