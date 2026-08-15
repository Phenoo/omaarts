'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { icons, Music2, ShoppingCart, UserCircle, Users } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useCustomerAuth } from '@/lib/context/CustomerAuthContext';
import { SITE } from '@/lib/site';
import { FaWhatsapp } from "react-icons/fa";

import { AiOutlineInstagram } from "react-icons/ai";
import { IoLogoTiktok } from "react-icons/io5";

import { CiFacebook } from "react-icons/ci";

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop Art', href: '/art' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Private Events', href: '/private-events' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: SITE.social.instagram, icon: AiOutlineInstagram },
  { label: 'TikTok', href: SITE.social.tiktok, icon: IoLogoTiktok },
  { label: 'Facebook', href: SITE.social.facebook, icon: CiFacebook },
  { label: 'WhatsApp', href: SITE.whatsappHref, icon: FaWhatsapp },

];

export default function NavigationOverlay() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(pathname === '/');
  const [isHidden, setIsHidden] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { cartCount } = useCart();
  const { isAuthenticated, profile } = useCustomerAuth();

  useEffect(() => { setIsOpen(false); }, [pathname]);
  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const distance = currentY - previousY;

        if (currentY < 24 || distance < -6) setIsHidden(false);
        if (distance > 6 && currentY >= 24) setIsHidden(true);

        previousY = currentY;
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (pathname !== '/') {
      setIsHeroVisible(false);
      return;
    }

    const hero = document.getElementById('home-hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(hero);

    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    firstLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; };
  }, [isOpen]);

  if (pathname?.startsWith('/admin')) return null;

  return <>
    <header className={`site-header${pathname === '/' && isHeroVisible ? ' site-header--hero' : ''}${isHidden && !isOpen ? ' site-header--hidden' : ''}`}>
      <Link href="/" aria-label="Artsy by Oma home" className="site-logo"><span className="site-logo__name">Artsy</span><span className="site-logo__byline">by Oma</span></Link>
      <div className="site-header__actions">
        {
          isOpen &&
          <Link href={isAuthenticated ? '/account' : '/account/login'} className="icon-button" aria-label={isAuthenticated ? 'My account' : 'Sign in'}>{isMountedProfile(isAuthenticated, profile) ? <span aria-hidden="true">{profile?.displayName?.[0]?.toUpperCase() || 'A'}</span> :
            <UserCircle size={19} />}</Link>
        }



        <Link href="/cart" className="icon-button" aria-label={`Shopping cart${cartCount ? `, ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}`}><ShoppingCart size={18} />{cartCount > 0 && <span className="cart-count" aria-hidden="true">{cartCount}</span>}</Link><button type="button" className="menu-button" aria-expanded={isOpen} aria-controls="site-menu" onClick={() => setIsOpen((value) => !value)}>{isOpen ? 'Close' : 'Menu'}</button></div>
    </header>
    {isOpen && <div className="menu-backdrop" onClick={() => setIsOpen(false)}>
      <div id="site-menu" className="site-menu" role="dialog" aria-modal="true" aria-label="Site navigation" onClick={(event) => event.stopPropagation()}>

        <nav aria-label="Menu">{LINKS.map((link, index) => <Link key={link.href} href={link.href} ref={index === 0 ? firstLinkRef : undefined}>{link.label}</Link>)}</nav><div className="site-menu__footer"><p>Original works, studio experiences, and private events in Awka.</p>
          <div className="site-menu__socials" aria-label="Social media"><span className="eyebrow">Follow the studio</span><div className="site-menu__social-links">{SOCIAL_LINKS.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Follow Artsy by Oma on ${label}`}><Icon aria-hidden="true" size={20} strokeWidth={1.8} /></a>)}</div></div></div></div></div>}
  </>;
}

function isMountedProfile(isAuthenticated: boolean, profile: { displayName?: string } | null) {
  return isAuthenticated && Boolean(profile);
}
