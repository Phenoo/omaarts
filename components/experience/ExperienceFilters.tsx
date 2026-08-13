'use client';

import { useMemo, useState } from 'react';
import ExperienceCard from './ExperienceCard';
import { Activity } from '@/lib/types';

export default function ExperienceFilters({ experiences }: { experiences: Activity[] }) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const categories = [...new Set(experiences.map((experience) => experience.category))];
  const filtered = useMemo(() => experiences.filter((experience) => {
    const haystack = `${experience.name} ${experience.category} ${experience.shortDescription} ${experience.description}`.toLowerCase();
    return (category === 'all' || experience.category === category) && (!query || haystack.includes(query.toLowerCase()));
  }), [experiences, category, query]);

  return (
    <>
      <div className="filter-bar filter-bar--experiences">
        <label className="filter-search">Search experiences<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try paint, craft, or games" /></label>
        <div className="filter-tabs" aria-label="Experience categories"><button type="button" className={category === 'all' ? 'is-active' : ''} onClick={() => setCategory('all')}>All</button>{categories.map((item) => <button type="button" className={category === item ? 'is-active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      {filtered.length > 0 ? <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}</div> : <div className="empty-state" role="status"><h2 className="font-serif text-3xl">No experiences match that search.</h2><p>Try another category or clear the search.</p><button type="button" className="button button--outline" onClick={() => { setCategory('all'); setQuery(''); }}>Clear filters</button></div>}
    </>
  );
}
