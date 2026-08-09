'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Z_INDEX } from '@/constants';
import { useSizeGuide } from './SizeGuideContext';
import {
  SIZE_GUIDE_CHARTS,
  formatSizeUnit,
  type UnitSystem,
} from '@/data/size-guide';

/**
 * Interactive size guide modal.
 *
 * ── Content ────────────────────────────────────────────────
 * • Garment tabs (Oversized Tee, Hoodie, Jacket, Joggers).
 * • CM ↔ Inches unit toggle.
 * • Measurement table per garment with an animated tab underline
 *   and cross-fading tab content.
 *
 * Rendered above the Quick View modal (`zIndex` offset) so it can be
 * opened from inside Quick View without being hidden behind it.
 */
export function SizeGuideModal() {
  const { isOpen, productName, closeSizeGuide } = useSizeGuide();
  const [unit, setUnit] = useState<UnitSystem>('cm');
  const [activeId, setActiveId] = useState(SIZE_GUIDE_CHARTS[0].id);

  const activeChart =
    SIZE_GUIDE_CHARTS.find(c => c.id === activeId) ?? SIZE_GUIDE_CHARTS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeSizeGuide}
      label="Size guide"
      zIndex={Z_INDEX.modal + 20}
      panelClassName="w-full max-w-2xl sm:rounded-2xl rounded-t-2xl border border-white/[0.06] shadow-2xl"
    >
      <div className="px-4 sm:px-6 pb-6">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-accent tracking-[0.25em] uppercase">
              Size Guide
            </p>
            {productName && (
              <h2 className="mt-1 text-lg font-display font-bold text-white leading-tight">
                {productName}
              </h2>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              Body measurements, not garment dimensions.
            </p>
          </div>

          {/* Unit toggle */}
          <div
            className="inline-flex shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5"
            role="group"
            aria-label="Measurement unit"
          >
            {(['cm', 'in'] as const).map(u => {
              const active = unit === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all',
                    active
                      ? 'bg-accent text-white'
                      : 'text-zinc-400 hover:text-white'
                  )}
                  aria-pressed={active}
                >
                  {u === 'cm' ? 'CM' : 'IN'}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Garment tabs ───────────────────────────────── */}
        <div
          role="tablist"
          aria-label="Garment type"
          className="mb-4 flex gap-1 overflow-x-auto border-b border-white/[0.06]"
        >
          {SIZE_GUIDE_CHARTS.map(chart => {
            const active = chart.id === activeId;
            return (
              <button
                key={chart.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`size-guide-panel-${chart.id}`}
                onClick={() => setActiveId(chart.id)}
                className={cn(
                  'relative shrink-0 px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {chart.label}
                {active && (
                  <motion.span
                    layoutId="size-guide-tab-underline"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Table ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart.id}
            id={`size-guide-panel-${activeChart.id}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                    <th className="py-2.5 pr-4 font-semibold">Size</th>
                    {activeChart.columns.map(col => (
                      <th
                        key={col.key}
                        className="whitespace-nowrap py-2.5 pr-4 font-semibold"
                      >
                        {col.label}{' '}
                        <span className="text-zinc-600">
                          ({unit === 'cm' ? 'cm' : 'in'})
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeChart.sizes.map(row => (
                    <tr
                      key={row.label}
                      className="border-t border-white/[0.04]"
                    >
                      <td className="py-2.5 pr-4 font-bold text-white">
                        {row.label}
                      </td>
                      {row.values.map((value, i) => (
                        <td
                          key={i}
                          className="py-2.5 pr-4 text-zinc-300 tabular-nums"
                        >
                          {formatSizeUnit(value, unit)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-zinc-500">{activeChart.note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}
