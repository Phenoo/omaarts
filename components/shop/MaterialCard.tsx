'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { PublicMaterial } from '@/lib/public-data';
import { formatNaira } from '@/lib/site';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';

export default function MaterialCard({ material }: { material: PublicMaterial }) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();
  const inCart = isInCart(material.id, 'material');

  const add = () => {
    if (inCart) {
      router.push('/cart');
      return;
    }
    addToCart(material);
    showToast(`Added "${material.title}" to your cart.`, 'success');
  };

  return (
    <article className="art-card group">
      <div className="relative art-card__image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={material.images[0]} alt={material.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl leading-tight tracking-tight">{material.title}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{material.category}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--accent-orange)]">Shop item</span>
      </div>
      {material.description && <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">{material.description}</p>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3">
        <span className="font-mono text-lg md:text-xl font-bold tracking-tight text-[var(--foreground)]">{formatNaira(material.price)}</span>
        <button type="button" onClick={add} className="px-4 py-2.5 rounded-full bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all inline-flex items-center gap-1.5">
          <ShoppingBag size={14} />
          {inCart ? 'View cart' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
