'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { isShopifyConfigured } from '@/lib/shopify/config';
import { cn } from '@/utils/cn';
import { siteConfig } from '@/config/site';

/**
 * Account settings (client).
 *
 * Personal information, password reset, marketing preferences, and account
 * deletion support. When Shopify is not configured the backend mutations
 * are unavailable, so those cards render in a read-only demo state.
 */
export function SettingsPageClient() {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const requestPasswordReset = useAuthStore(s => s.requestPasswordReset);
  const isLoading = useAuthStore(s => s.isLoading);

  const shopifyBacked = isShopifyConfigured();

  const [firstName, setFirstName] = useState(
    user?.firstName ?? user?.name?.split(' ')[0] ?? ''
  );
  const [lastName, setLastName] = useState(
    user?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? ''
  );
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    await requestPasswordReset(user.email);
    toast.success('Password reset link sent to your email');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-2xl space-y-8"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details and preferences.
        </p>
      </div>

      {/* Personal information */}
      <section className="rounded-2xl bg-surface border border-border p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-primary">
          <UserRound className="h-4 w-4 text-accent" aria-hidden="true" />
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          How we address you and reach you about your orders.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField
              label="First name"
              value={firstName}
              onChange={setFirstName}
              autoComplete="given-name"
            />
            <SettingsField
              label="Last name"
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
            />
          </div>
          <SettingsField
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+1 (555) 000-0000"
            type="tel"
            autoComplete="tel"
          />
          <button
            type="submit"
            disabled={saving || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-2xl bg-surface border border-border p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-primary">
          <KeyRound className="h-4 w-4 text-accent" aria-hidden="true" />
          Password
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          We&apos;ll email you a secure link to reset your password.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={!user?.email || isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-accent/50 hover:text-white disabled:opacity-50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Send reset link
          </button>
          {!shopifyBacked && (
            <p className="mt-3 text-xs text-zinc-600">
              Demo mode: resetting will be delivered once Shopify checkout is
              configured.
            </p>
          )}
        </div>
      </section>

      {/* Marketing preferences */}
      <section className="rounded-2xl bg-surface border border-border p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-primary">
          <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
          Marketing Preferences
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose whether you&apos;d like to hear about new drops and offers.
        </p>
        <MarketingToggle
          enabled={user?.acceptsMarketing ?? true}
          disabled={!shopifyBacked || isLoading}
          onToggle={async value => {
            await updateProfile({ acceptsMarketing: value });
            toast.success(
              value ? 'Marketing emails enabled' : 'Marketing emails disabled'
            );
          }}
        />
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl bg-destructive/5 border border-destructive/20 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-destructive">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Account Deletion
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Deleting your account removes your saved addresses and order history.
          This is permanent and cannot be undone.
        </p>
        <a
          href={`mailto:support@${new URL(siteConfig.url).hostname}?subject=Requesting%20account%20deletion`}
          className="mt-6 inline-flex items-center rounded-xl bg-destructive/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/20"
        >
          Contact Support to Delete
        </a>
      </section>
    </motion.div>
  );
}

// ─── Settings field ─────────────────────────────────────────────

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-primary placeholder-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
      />
    </label>
  );
}

// ─── Marketing toggle ───────────────────────────────────────────

function MarketingToggle({
  enabled,
  disabled,
  onToggle,
}: {
  enabled: boolean;
  disabled: boolean;
  onToggle: (value: boolean) => Promise<void>;
}) {
  return (
    <div className="mt-6">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Marketing emails"
        disabled={disabled}
        onClick={() => void onToggle(!enabled)}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          disabled
            ? 'opacity-60 cursor-not-allowed border-border'
            : 'cursor-pointer border-border hover:border-accent/40'
        )}
      >
        <span
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            enabled ? 'bg-accent' : 'bg-zinc-700'
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
            )}
          />
        </span>
        <span className="text-sm text-zinc-300">
          {enabled ? 'Opted in' : 'Opted out'}
        </span>
      </button>
      <p className="mt-2 text-xs text-zinc-600">
        We only email you about launches and offers you&apos;d care about. No
        spam, unsubscribe anytime.
      </p>
    </div>
  );
}
