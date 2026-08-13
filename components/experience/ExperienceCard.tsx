import Image from 'next/image';
import Link from 'next/link';
import { Activity } from '@/lib/types';
import { formatNaira } from '@/lib/site';

export default function ExperienceCard({ experience }: { experience: Activity }) {
  const lowestPrice = experience.variants.length > 0
    ? Math.min(...experience.variants.map((variant) => variant.price))
    : experience.basePrice;
  const price = experience.pricingModel === 'BOOKING_ONLY' || experience.pricingModel === 'CUSTOM_QUOTE'
    ? 'Enquire for pricing'
    : `${formatNaira(lowestPrice)} / ${experience.priceUnit || 'person'}`;

  return (
    <article className="experience-card group">
      <Link href={`/experiences/${experience.slug}`} className="block" aria-label={`View ${experience.name} experience`}>
        <div className="experience-card__image">
          <Image src={experience.images[0] || '/images/artist-studio.png'} alt={`${experience.name} at Artsy by Oma`} fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{experience.category}</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight">{experience.name}</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{experience.duration}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{experience.shortDescription || experience.description}</p>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--border-soft)] pt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--accent-orange)]">{price}</span>
        <Link href={`/experiences/${experience.slug}`} className="button button--small">Book / enquire</Link>
      </div>
    </article>
  );
}
