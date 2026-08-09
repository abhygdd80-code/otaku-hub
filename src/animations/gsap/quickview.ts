import gsap from 'gsap';
import { DURATION } from '@/constants';

/**
 * Quick View entrance reveal.
 *
 * Staggers every `[data-quickview-reveal]` element inside the modal body
 * (category, title, price, selectors, actions, related preview…) with a
 * soft fade + rise. Skips to fully visible under `prefers-reduced-motion`.
 *
 * @param scope — container that holds the reveal targets (inline `opacity: 0`)
 */
export function createQuickViewEntrance(
  scope: HTMLElement
): gsap.core.Timeline | undefined {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    gsap.set(scope, { opacity: 1 });
    return undefined;
  }

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  timeline.set(scope, { opacity: 1 }).fromTo(
    scope.querySelectorAll<HTMLElement>('[data-quickview-reveal]'),
    { autoAlpha: 0, y: 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.slow,
      stagger: DURATION.stagger.slow,
    },
    0.1
  );

  return timeline;
}
