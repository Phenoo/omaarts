'use client';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      {/* @ts-expect-error React 19 type mismatch workaround */}
      {children}
    </ReactLenis>
  );
}
