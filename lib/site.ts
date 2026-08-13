export const SITE = {
  name: 'Artsy by Oma',
  artist: 'Oma Achebe',
  description:
    'Original contemporary artwork, guided studio experiences, and private creative events by Oma Achebe in Awka, Nigeria.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://artsybyoma.com',
  email: 'support@artsybyoma.com',
  phoneDisplay: '0816 700 9545',
  phoneHref: 'tel:+2348167009545',
  whatsappHref: 'https://wa.me/2348167009545',
  location: 'Awka, Anambra, Nigeria',
  social: {
    instagram: 'https://www.instagram.com/artsyby_oma',
    tiktok: 'https://www.tiktok.com/@artsybyoma',
    facebook: 'https://www.facebook.com/share/1GrxnpA1CX/',
  },
} as const;

export function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE.url).toString();
}
