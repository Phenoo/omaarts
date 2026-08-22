import Link from 'next/link';
import Image from 'next/image';
import type { PublicExperience } from '@/lib/public-data';
import { formatNaira } from '@/lib/site';

export default function FeaturedActivities({ experiences }: { experiences: PublicExperience[] }) {
  const featuredExperiences = experiences.filter((experience) => experience.featured).slice(0, 3);
  if (featuredExperiences.length === 0) return null;
  return <section className="experience-strip" aria-labelledby="experiences-heading"><div className="max-w-[90vw] mx-auto"><div className="section-heading"><div><p className="eyebrow">Studio experiences</p><h2 id="experiences-heading">Make time to make something.</h2></div><Link href="/experiences" className="text-link">View all experiences</Link></div><div className="grid gap-6 md:grid-cols-3">{featuredExperiences.map((experience) => { const price = experience.pricingModel === 'BOOKING_ONLY' || experience.pricingModel === 'CUSTOM_QUOTE' ? 'Enquire for pricing' : `${formatNaira(experience.basePrice)} / ${experience.priceUnit || 'person'}`; return <article key={experience.id} className="experience-card group"><Link href={`/experiences/${experience.slug}`}><div className="experience-card__image"><Image src={experience.images[0] || '/images/studio/IMG_0890.png'} alt={`${experience.name} at Artsy by Oma`} fill sizes="(max-width: 768px) 92vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div><p className="eyebrow mt-4">{experience.category} · {experience.duration}</p><h3 className="mt-2 font-serif text-2xl">{experience.name}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{experience.shortDescription || experience.description}</p><p className="mt-4 font-sans text-sm md:text-base font-extrabold tracking-tight text-[var(--accent-orange)]">{price}</p></Link></article>; })}</div></div></section>;
}
