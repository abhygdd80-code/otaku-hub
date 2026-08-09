'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users */
  redirectTo?: string;
}

/**
 * Protects child routes by requiring authentication.
 * Redirects to the login page (or a custom path) if the user is not signed in.
 *
 * On mount it reconciles the persisted session against the server cookie
 * (`initSession`) so a stale "signed in" store never renders protected
 * content — nor does a valid session get bounced before reconciliation.
 * Renders children immediately afterwards with no flash of redirected content.
 */
export function AuthGuard({
  children,
  redirectTo = '/auth/login',
}: AuthGuardProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const initSession = useAuthStore(s => s.initSession);
  const router = useRouter();

  /** True once the server-side session check has settled. */
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    initSession().finally(() => {
      if (mounted) setSessionChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, [initSession]);

  useEffect(() => {
    if (sessionChecked && !isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [sessionChecked, isAuthenticated, isLoading, redirectTo, router]);

  // Reconciling session against the server — do not redirect yet.
  if (!sessionChecked || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated — will redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // Authenticated — render children
  return <>{children}</>;
}
