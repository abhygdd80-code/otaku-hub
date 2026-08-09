'use client';

// ─── Announcement Bar Store ──────────────────────────────────
// Persists dismissal of the rotating announcement bar so it never
// reappears once closed (until storage is cleared).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnnouncementState {
  /** Whether the user dismissed the announcement bar */
  isDismissed: boolean;
  /** Hide the bar for this session and future visits */
  dismiss: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    set => ({
      isDismissed: false,
      dismiss: () => set({ isDismissed: true }),
    }),
    { name: 'otaku-announcement' }
  )
);
