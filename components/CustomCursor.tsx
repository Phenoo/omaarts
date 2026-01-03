'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Activate custom cursor class on body to hide default cursor
    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });
    };

    const onMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      }
    };

    const onMouseLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    // Add event listeners to all interactive elements effectively? 
    // A better approach for "all future elements" is using a global listener or checking document.elementFromPoint functionality, 
    // but delegation works well for simple things.
    // simpler: check target on mousemove? or use event delegation on body
    
    const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('a') || target.closest('button') || target.closest('.cursor-hover');
        if (clickable) {
            setIsHovering(true);
        } else {
            setIsHovering(false);
        }
    };
    
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (isHovering) {
      gsap.to(cursor, {
        scale: 2.5,
        backgroundColor: '#00E5FF', // Accent color
        mixBlendMode: 'difference',
        duration: 0.3,
      });
    } else {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: '#1A1A1A', // Default dark
        mixBlendMode: 'normal',
        duration: 0.3,
      });
    }
  }, [isHovering]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
      style={{ backgroundColor: '#1A1A1A' }}
    />
  );
}
