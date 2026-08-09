'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomerAddress } from '@/types/auth';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import Link from 'next/link';

/**
 * Saved addresses (client).
 *
 * Reads the authenticated customer's address book from /api/addresses and
 * supports add / edit / delete / set-default. When Shopify is not
 * configured the API returns 503 and this page shows an informational
 * state instead of a broken grid.
 */
export function AddressesPageClient() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | 'new' | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/addresses');
      if (res.status === 503 || res.status === 401) {
        setUnavailable(true);
        setAddresses([]);
        return;
      }
      const data = (await res.json()) as {
        addresses: CustomerAddress[];
        defaultAddress: CustomerAddress | null;
      };
      setAddresses(data.addresses ?? []);
      setDefaultId(data.defaultAddress?.id ?? null);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? 'Could not delete address');
        return;
      }
      setAddresses(prev => prev.filter(a => a.id !== id));
      if (defaultId === id) setDefaultId(null);
      toast.success('Address deleted');
    } catch {
      toast.error('Could not delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch('/api/addresses/default', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? 'Could not set default address');
        return;
      }
      setDefaultId(id);
      toast.success('Default address updated');
    } catch {
      toast.error('Could not set default address');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
            Saved Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Speed up checkout with your saved shipping details.
          </p>
        </div>
        {!unavailable && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Address
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : unavailable ? (
        <UnavailableState />
      ) : addresses.length === 0 ? (
        <EmptyState onAdd={() => setEditing('new')} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              isDefault={address.id === defaultId}
              onEdit={() => setEditing(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </ul>
      )}

      <AnimatePresence>
        {editing && (
          <AddressEditor
            address={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={async () => {
              await load();
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Address Card ───────────────────────────────────────────────

function AddressCard({
  address,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: CustomerAddress;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <li
      className={cn(
        'relative rounded-2xl bg-surface border p-5',
        isDefault ? 'border-accent/40' : 'border-border'
      )}
    >
      {isDefault && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
          <Star className="h-3 w-3" aria-hidden="true" />
          Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/70 ring-1 ring-border">
          <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary">
            {[address.firstName, address.lastName].filter(Boolean).join(' ') ||
              'Address'}
          </p>
          <div className="mt-1 space-y-0.5 text-xs text-zinc-400">
            {address.address1 && <p>{address.address1}</p>}
            {address.address2 && <p>{address.address2}</p>}
            <p>
              {[address.city, address.province, address.zip]
                .filter(Boolean)
                .join(', ')}
              {address.country ? `, ${address.country}` : ''}
            </p>
            {address.phone && <p>{address.phone}</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
        {!isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-accent hover:bg-accent/5 transition-colors"
          >
            <Star className="h-3 w-3" aria-hidden="true" />
            Set default
          </button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${address.address1 ?? 'address'}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${address.address1 ?? 'address'}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Address Editor (add / edit dialog) ────────────────────────

interface AddressDraft {
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  firstName: string;
  lastName: string;
}

function AddressEditor({
  address,
  onClose,
  onSaved,
}: {
  address: CustomerAddress | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<AddressDraft>({
    address1: address?.address1 ?? '',
    address2: address?.address2 ?? '',
    city: address?.city ?? '',
    province: address?.province ?? '',
    country: address?.country ?? '',
    zip: address?.zip ?? '',
    phone: address?.phone ?? '',
    firstName: address?.firstName ?? '',
    lastName: address?.lastName ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof AddressDraft) => (value: string) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.address1.trim() || !draft.city.trim() || !draft.zip.trim()) {
      toast.error('Address, city and zip are required');
      return;
    }
    setSaving(true);
    try {
      const url = address ? `/api/addresses/${address.id}` : '/api/addresses';
      const method = address ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? 'Could not save address');
        return;
      }
      toast.success(address ? 'Address updated' : 'Address added');
      await onSaved();
    } catch {
      toast.error('Could not save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={address ? 'Edit address' : 'Add address'}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
          <h2 className="font-display text-lg font-bold text-primary">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First name"
              value={draft.firstName}
              onChange={set('firstName')}
            />
            <Field
              label="Last name"
              value={draft.lastName}
              onChange={set('lastName')}
            />
          </div>
          <Field
            label="Address"
            required
            value={draft.address1}
            onChange={set('address1')}
            placeholder="Street address"
          />
          <Field
            label="Apartment / Suite"
            value={draft.address2}
            onChange={set('address2')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="City"
              required
              value={draft.city}
              onChange={set('city')}
            />
            <Field
              label="State / Province"
              value={draft.province}
              onChange={set('province')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="ZIP / Postal code"
              required
              value={draft.zip}
              onChange={set('zip')}
            />
            <Field
              label="Country"
              value={draft.country}
              onChange={set('country')}
              placeholder="United States"
            />
          </div>
          <Field label="Phone" value={draft.phone} onChange={set('phone')} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Form field ─────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary placeholder-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
      />
    </label>
  );
}

// ─── Empty / unavailable states ─────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl bg-surface border border-border px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 ring-1 ring-border">
        <MapPin className="h-7 w-7 text-zinc-400" strokeWidth={1.6} />
      </div>
      <h2 className="font-display text-lg font-bold text-primary">
        No saved addresses
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
        Add your shipping details to check out faster next time.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Address
      </button>
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="rounded-2xl bg-surface border border-border px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 ring-1 ring-border">
        <MapPin className="h-7 w-7 text-zinc-400" strokeWidth={1.6} />
      </div>
      <h2 className="font-display text-lg font-bold text-primary">
        Address sync is not available
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
        Saved addresses require the Shopify store connection. Until that is
        configured, addresses entered at checkout are not persisted here.
      </p>
      <Link
        href={ROUTES.shop}
        className="mt-6 inline-flex items-center rounded-xl bg-accent px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
