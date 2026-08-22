'use client';

import { useEffect } from 'react';

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let disposed = false;
    let frame = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;

    import('lenis').then(({ default: Lenis }) => {
      if (disposed) return;

      lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };

      frame = requestAnimationFrame(raf);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
