'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, Settings } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

// ─── Navigation items ────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Profile', href: ROUTES.account.profile, icon: User },
  { label: 'Orders', href: ROUTES.account.orders, icon: Package },
  { label: 'Addresses', href: ROUTES.account.addresses, icon: MapPin },
  { label: 'Settings', href: ROUTES.account.settings, icon: Settings },
] as const;

// ─── Account Layout ──────────────────────────────────────────────

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-[80vh]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <AccountShell>{children}</AccountShell>
        </div>
      </div>
    </AuthGuard>
  );
}

// ─── Shell with sidebar (split from layout for clarity) ──────────

function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /** Active if the current path starts with the item's href. */
  const isActive = (href: string) => {
    if (href === ROUTES.account.root) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* ── Mobile tabs ──────────────────────────────────────── */}
      <nav
        className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:hidden"
        aria-label="Account navigation"
      >
        <ul className="flex gap-1 border-b border-border/60" role="tablist">
          {NAV_ITEMS.map(item => (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                role="tab"
                aria-selected={isActive(item.href)}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive(item.href)
                    ? 'border-accent text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:block shrink-0 w-56">
        <nav aria-label="Account navigation">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isActive(item.href)
                      ? 'bg-accent/10 text-white'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                  )}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ── Page content ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
