'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Heart, Package, MapPin, Settings } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

/**
 * Account button & dropdown menu for the navbar.
 *
 * Unauthenticated:
 *   → Link to login page
 *
 * Authenticated:
 *   → Avatar/initials button → dropdown with profile, orders, wishlist, logout
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          'text-zinc-400 hover:text-white hover:bg-white/5',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
        aria-label="Sign in"
      >
        <User className="w-[18px] h-[18px]" />
      </Link>
    );
  }

  // The store can briefly report authenticated=true before `user` hydrates
  // (e.g. a partial persist rehydrate). Guard so the dropdown never renders
  // against a null user.
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full',
          'text-zinc-400 hover:text-white hover:bg-white/5',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
        aria-label={`Account: ${user.name}`}
      >
        <span className="text-xs font-bold text-zinc-300">{initials}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl bg-surface border border-border shadow-xl shadow-black/30 overflow-hidden"
              role="menu"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-sm font-semibold text-primary truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <DropdownItem
                  href={ROUTES.account.profile}
                  icon={User}
                  label="My Profile"
                />
                <DropdownItem
                  href={ROUTES.account.orders}
                  icon={Package}
                  label="Orders"
                />
                <DropdownItem
                  href={ROUTES.account.addresses}
                  icon={MapPin}
                  label="Addresses"
                />
                <DropdownItem
                  href={ROUTES.account.settings}
                  icon={Settings}
                  label="Settings"
                />
                <DropdownItem href="/wishlist" icon={Heart} label="Wishlist" />
              </div>

              {/* Logout */}
              <div className="p-1.5 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-destructive hover:bg-destructive/5 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dropdown Item ─────────────────────────────────────────────

interface DropdownItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function DropdownItem({ href, icon: Icon, label }: DropdownItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
      role="menuitem"
      onClick={e => e.stopPropagation()}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
