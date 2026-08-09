'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Z_INDEX } from '@/constants';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Module-level Escape handler stack — only the topmost open modal responds
// to Escape, so stacked dialogs (Size Guide over Quick View) close one at
// a time instead of collapsing together.
const escStack: Array<() => void> = [];

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && escStack.length > 0) {
      const top = escStack[escStack.length - 1];
      top();
    }
  });
}

/** Counts open modals so the body scroll lock releases only when the last one closes. */
let openModalCount = 0;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessibility label describing the dialog */
  label: string;
  children: ReactNode;
  /** Override panel z-index (used to layer a nested dialog above its parent) */
  zIndex?: number;
  /** Panel sizing + styling classes (width, rounding, border…) */
  panelClassName?: string;
  /** Hide the built-in close button (e.g. when content provides its own) */
  hideClose?: boolean;
}

/**
 * Reusable modal dialog foundation used by Quick View, Size Guide, and
 * the Write Review dialog.
 *
 * ── Behaviour ────────────────────────────────────────────────
 * • Framer Motion mount / unmount transitions (backdrop fade + panel spring).
 * • Escape closes only the topmost dialog (module-level stack).
 * • Click on the backdrop closes; clicks inside the panel never do.
 * • Focus trap: Tab / Shift+Tab cycle within the panel.
 * • Body scroll lock — shared counter so stacked modals stay locked
 *   until the last one closes.
 * • Focus is restored to the previously focused element on close.
 * • A sticky close-action row stays pinned while the body scrolls.
 *   Elements marked `data-autofocus` receive focus on open.
 *
 * ── Accessibility ────────────────────────────────────────────
 * `role="dialog"`, `aria-modal`, and `aria-labelledby` are set by the
 * panel; a close button with an aria-label is rendered by default.
 */
export function Modal({
  isOpen,
  onClose,
  label,
  children,
  zIndex = Z_INDEX.modal,
  panelClassName,
  hideClose = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    openModalCount += 1;
    document.body.style.overflow = 'hidden';
    escStack.push(onClose);

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the close action (or the first `data-autofocus` element) once mounted.
    const autofocus =
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]');
    (autofocus ?? panelRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(el => el.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = '';
      }

      const stackIndex = escStack.indexOf(onClose);
      if (stackIndex !== -1) escStack.splice(stackIndex, 1);

      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0" style={{ zIndex }}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel layer — closes on backdrop clicks, not on panel clicks */}
          <div
            className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4"
            onClick={onClose}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelId}
              tabIndex={-1}
              className={cn(
                'relative flex w-full flex-col bg-background text-foreground',
                'max-h-[92vh] focus-visible:outline-none',
                panelClassName
              )}
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={event => event.stopPropagation()}
            >
              {/* Sticky close-action row */}
              <div
                className={cn(
                  'relative z-20 flex items-center justify-end',
                  hideClose ? 'hidden' : 'p-3 sm:p-4'
                )}
              >
                <button
                  type="button"
                  data-autofocus
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <span id={labelId} className="sr-only">
                  {label}
                </span>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
