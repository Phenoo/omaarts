import Image from 'next/image';
import Link from 'next/link';
import { PublicArtwork } from '@/lib/public-data';
import { formatNaira } from '@/lib/site';

export default function ArtworkCard({ artwork }: { artwork: PublicArtwork }) {
  const priceLabel = artwork.status === 'AVAILABLE' && artwork.price > 0
    ? formatNaira(artwork.price)
    : 'Price on request';

  const isNairaPrice = artwork.status === 'AVAILABLE' && artwork.price > 0;

  return (
    <article className="art-card group">
      <Link href={`/art/${artwork.slug}`} className="block" aria-label={`View ${artwork.title}`}>
        <div className="art-card__image">
          <Image
            src={artwork.images[0]}
            alt={`${artwork.title}, ${artwork.medium} by Oma Achebe`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl leading-tight tracking-tight">{artwork.title}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{artwork.medium}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{artwork.year}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3">
        <span className={isNairaPrice ? "font-mono text-lg md:text-xl font-bold tracking-tight text-[var(--foreground)]" : "font-mono text-xs uppercase tracking-[0.14em] font-semibold text-[var(--accent-orange)]"}>
          {priceLabel}
        </span>
        <Link
          href={`/art/${artwork.slug}`}
          className="px-4 py-2.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-sm hover:shadow inline-flex items-center justify-center text-center"
        >
          {isNairaPrice ? 'Buy Now' : 'View Work'}
        </Link>
      </div>
    </article>
  );
}
