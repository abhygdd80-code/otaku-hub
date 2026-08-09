'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface DesktopNavProps {
  className?: string;
}

const NAV_ITEMS = [
  { label: 'Home', href: ROUTES.home },
  { label: 'Collections', href: ROUTES.collections },
  { label: 'New Drops', href: ROUTES.newArrivals },
] as const;

/**
 * Desktop-only center navigation links.
 *
 * Renders a horizontal row of links visible from the `md` breakpoint.
 * Each link has an accent underline indicator that scales in on active
 * or hover. Active route is detected via `usePathname()` with prefix
 * matching so sub-routes light up their parent link.
 */
export function DesktopNav({ className }: DesktopNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        'hidden md:flex items-center justify-center gap-0.5',
        className
      )}
      aria-label="Desktop navigation"
    >
      {NAV_ITEMS.map(link => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative px-4 py-2 text-sm font-medium tracking-wide rounded-lg transition-colors group',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:text-white',
              active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
            <span
              className={cn(
                'absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-accent transition-transform duration-300 origin-left',
                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
