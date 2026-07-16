import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Create lenis instance if not exists
    if (!lenisRef.current) {
      const lenisOptions = {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      };
      lenisRef.current = new Lenis(lenisOptions as any);
    }

    const lenis = lenisRef.current;

    // Use requestAnimationFrame to update the scroll
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return lenisRef.current;
};
