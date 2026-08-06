'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Manages a single user preference value in a client component.
 *
 * Responsibilities:
 * - Holds optimistic local state for instant UI feedback (no waiting for the server).
 * - Keeps local state in sync when the server re-resolves the initial value
 *   (e.g. user changes preference on another device → middleware syncs DB → cookie →
 *   next router.refresh() delivers the updated `initialValue` from the Server Component).
 * - Calls the provided `onChange` server action, then triggers `router.refresh()` to
 *   update all Server Components with the new preference.
 * - Rolls back local state to the previous value if the persistence call fails,
 *   so the UI never lies about what was actually saved.
 *
 * @param initialValue  Server-resolved value, passed as a prop from a Server Component.
 * @param onChange      Server action that persists the new value (DB-first or cookie-only).
 * @param label         Short identifier used in error log messages (e.g. 'language', 'theme').
 *
 * @example
 * const { value: language, handleChange: handleLanguageChange } = useUserPreference(
 *   initialLanguage,
 *   changeLanguage,
 *   'language',
 * );
 */
export function useUserPreference<T>(
  initialValue: T,
  onChange: (value: T) => Promise<void>,
  label: string,
) {
  const router = useRouter();
  const [value, setValue] = useState<T>(initialValue);

  // Sync with server-resolved value after a router.refresh() or navigation.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = async (newValue: T) => {
    const previous = value;
    setValue(newValue); // optimistic update for instant feedback

    try {
      await onChange(newValue);
      // Re-render Server Components (Navbar, layout, …) with the new preference.
      // router.refresh() is preferred over a full page reload for better UX.
      router.refresh();
    } catch (error) {
      console.error(`[useUserPreference] failed to change ${label}:`, error);
      setValue(previous); // rollback — never lie about what was saved
    }
  };

  return { value, handleChange } as const;
}
