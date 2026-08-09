import { type Variants } from 'framer-motion';
import { DURATION } from '@/constants';

// ─── Fade Variants ─────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.normal } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: 'easeOut' },
  },
};

// ─── Stagger Container ─────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: DURATION.stagger.normal,
      delayChildren: 0.1,
    },
  },
};

// ─── Single-child fade up (for use with stagger) ─────────────

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/**
 * Stagger container that uses `initial` / `animate` naming.
 * @param delay — stagger delay per child (default: 0.08)
 */
export const stagger = (delay = 0.08) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: delay },
  },
});
