import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ContactForm from '@/components/forms/ContactForm';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Artsy by Oma and Oma Achebe about original artwork, commissions, studio experiences, and private events in Awka.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact | Artsy by Oma', description: 'Start a conversation with Oma Achebe and the Artsy by Oma studio.', url: '/contact', images: [{ url: '/images/about-me.jpg', alt: 'Oma Achebe in the studio' }] },
};

export default function ContactPage() {
  return <main id="main-content" className="site-main"><div className="page-shell"><div className="contact-grid"><section className="contact-intro"><p className="eyebrow">Contact the studio</p><h1>Let&apos;s talk about the work.</h1><p className="lede">For original works, commissions, studio experiences, and private events, send a note and we&apos;ll get back to you with the right next step.</p><div className="contact-details"><div><p className="eyebrow">Visit / book in</p><p>{SITE.location}<br />Exact studio directions are shared with confirmed bookings.</p></div><div><p className="eyebrow">Reach us</p><p><a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><br /><a href={SITE.whatsappHref} target="_blank" rel="noreferrer">WhatsApp the studio</a><br /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p></div><div><p className="eyebrow">Booking hours</p><p>By appointment<br />Please allow 24 hours for a reply.</p></div></div><div className="contact-links"><Link href="/art" className="text-link">Browse the art</Link><Link href="/experiences" className="text-link">See experiences</Link><Link href="/private-events" className="text-link">Plan a private event</Link></div></section><aside className="form-panel"><ContactForm /></aside></div></div><Footer /></main>;
}
