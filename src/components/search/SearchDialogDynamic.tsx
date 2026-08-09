'use client';

import dynamic from 'next/dynamic';

const SearchDialogInner = dynamic(
  () => import('@/components/search/SearchDialog').then(m => m.SearchDialog),
  { ssr: false }
);

/**
 * Client-side wrapper for the SearchDialog dynamic import.
 * This file exists so the `dynamic()` call with `ssr: false` lives
 * in a client component, avoiding Next.js 15 restrictions on
 * `dynamic()` in Server Components.
 */
export function SearchDialogDynamic() {
  return <SearchDialogInner />;
}
