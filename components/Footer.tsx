import Link from 'next/link';
import { SITE } from '@/lib/site';

const SOCIALS = [
  { label: 'Instagram', href: SITE.social.instagram },
  { label: 'TikTok', href: SITE.social.tiktok },
  { label: 'WhatsApp', href: SITE.whatsappHref },
  { label: 'Email', href: `mailto:${SITE.email}` },
];

export default function Footer() {
  return <footer className="site-footer"><div className="site-footer__grid"><div><Link href="/" className="footer-logo" aria-label="Artsy by Oma home"><span className="footer-logo__name">Artsy</span><span className="footer-logo__byline">by Oma</span></Link><p className="max-w-sm text-sm leading-relaxed text-white/72">Original works, studio experiences, and commissioned pieces by Oma Achebe in Awka.</p><p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">{SITE.location}<br />{SITE.phoneDisplay}<br />{SITE.email}</p></div><div><p className="footer-label">Explore</p><nav className="footer-links" aria-label="Footer explore links"><Link href="/art">Art</Link><Link href="/art">Available Works</Link><Link href="/art/commissions">Commissions</Link><Link href="/about">About</Link></nav></div><div><p className="footer-label">Studio</p><nav className="footer-links" aria-label="Footer studio links"><Link href="/experiences">Experiences</Link><Link href="/private-events">Private Events</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link></nav></div><div><p className="footer-label">Connect</p><nav className="footer-links" aria-label="Social links">{SOCIALS.map((social) => <a key={social.label} href={social.href} target={social.href.startsWith('mailto:') ? undefined : '_blank'} rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer'}>{social.label}</a>)}</nav></div></div><div className="site-footer__bottom"><span>© {new Date().getFullYear()} Artsy by Oma</span><span>Contemporary art · Awka, Nigeria</span></div></footer>;
}
