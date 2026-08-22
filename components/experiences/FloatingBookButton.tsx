'use client';

import { useEffect, useState } from 'react';

export default function FloatingBookButton() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById('booking-form');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <a 
      href="#booking-form" 
      className={`fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full bg-[var(--accent-purple)] px-6 py-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-white font-black shadow-[0_12px_30px_rgba(58,30,112,0.3)] transition-all duration-300 hover:bg-[var(--accent-orange)] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      Book this experience
    </a>
  );
}
