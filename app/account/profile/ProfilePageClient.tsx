'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { AuthInput } from '@/components/auth/AuthInput';
import { fadeUp, stagger } from '@/animations/framer/variants';
import { ROUTES } from '@/constants';

/**
 * Account profile page — now rendered inside the shared account layout
 * which handles AuthGuard. This component contains only the profile
 * content and sign-out action.
 */
export function ProfilePageClient() {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const logout = useAuthStore(s => s.logout);
  const clearError = useAuthStore(s => s.clearError);
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    clearError();
    await updateProfile({ name: name.trim() });
    setSaving(false);
    if (useAuthStore.getState().error) {
      toast.error(useAuthStore.getState().error ?? 'Unable to update profile.');
      return;
    }
    toast.success('Profile updated');
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    router.push('/');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-2xl space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-primary">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Avatar + Info */}
      <motion.div
        variants={stagger(0.08)}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-surface border border-border"
      >
        <motion.div
          variants={fadeUp}
          className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center shrink-0"
        >
          <span className="text-2xl font-bold text-accent">
            {user?.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </motion.div>

        <div className="space-y-3 text-center sm:text-left">
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <User className="w-4 h-4 text-accent" />
            <span className="text-primary font-semibold">{user?.name}</span>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <Mail className="w-4 h-4 text-accent" />
            <span>{user?.email}</span>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <Calendar className="w-4 h-4 text-accent" />
            <span>Member since {memberSince}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.form
        onSubmit={handleSave}
        variants={stagger(0.08)}
        initial="initial"
        animate="animate"
        className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-5"
      >
        <motion.h2
          variants={fadeUp}
          className="text-lg font-display font-bold text-primary"
        >
          Edit Profile
        </motion.h2>

        <motion.div variants={fadeUp}>
          <AuthInput
            label="Full Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Your name"
            autoComplete="name"
            icon={<User className="w-4 h-4" />}
            disabled={saving}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AuthInput
            label="Email"
            type="email"
            value={user?.email ?? ''}
            onChange={() => {}}
            placeholder="Email"
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
            disabled={true}
            required={false}
          />
          <p className="text-xs text-zinc-600 mt-1">Email cannot be changed.</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <button
            type="submit"
            disabled={saving}
            className="group relative w-full sm:w-auto px-8 py-3 rounded-xl bg-accent text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span
              className={
                saving ? 'opacity-0' : 'flex items-center justify-center gap-2'
              }
            >
              <Save className="w-4 h-4" />
              Save Changes
            </span>
            {saving && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </span>
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4"
      >
        <h2 className="text-lg font-display font-bold text-destructive">
          Sign Out
        </h2>
        <p className="text-sm text-zinc-500">
          You will be redirected to the home page and will need to sign in
          again.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </motion.div>
  );
}
