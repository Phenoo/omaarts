'use client';

import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { PublicArtwork } from '@/lib/public-data';

export default function ArtworkActions({ artwork }: { artwork: PublicArtwork }) {
  const { addToCart, isInCart } = useCart();
  const purchasable = artwork.status === 'AVAILABLE' && artwork.availableForSale && artwork.price > 0;

  if (!purchasable) {
    return <Link href={`/contact?subject=${encodeURIComponent(`Artwork enquiry: ${artwork.title}`)}`} className="button button--primary w-full">Enquire about this work</Link>;
  }

  const alreadyInCart = isInCart(artwork.id);
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className="button button--primary w-full" onClick={() => addToCart(artwork)} disabled={alreadyInCart}>
        {alreadyInCart ? 'Added to cart' : 'Add to cart'}
      </button>
      {alreadyInCart && <Link href="/cart" className="text-link text-center">View cart</Link>}
    </div>
  );
}
