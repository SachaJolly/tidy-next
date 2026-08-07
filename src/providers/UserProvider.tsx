'use client';

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import type { User } from '@/lib/types';

/**
 * Client-side user store hydrated from the server.
 *
 * Pattern:
 * - Server layout fetches user once (`getUser()`).
 * - Provider receives that value via `initialUser`.
 * - Deep client components consume `useUser()` without prop drilling or refetching.
 */
type UserContextValue = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
};

type UserProviderProps = {
  // Server-resolved user injected once at provider mount time.
  initialUser: User | null;
  children: ReactNode;
};

/**
 * Nullable default is intentional:
 * - `null` means "provider not mounted yet" in `useUser()` guard.
 * - A mounted provider can still expose `user: null` for guest sessions.
 */
const UserContext = createContext<UserContextValue | null>(null);

/**
 * Provides global client access to authenticated user state.
 *
 * This provider does not fetch data itself: it only hydrates/holds state passed
 * from the server tree (`initialUser`) so nested client components can read or
 * update the user object without prop drilling.
 */
export function UserProvider({ initialUser, children }: UserProviderProps) {
  // Initialize from server payload to avoid an extra client request on first render.
  const [user, setUser] = useState<User | null>(initialUser);

  // Stable memoized context value to avoid unnecessary rerenders in consumers.
  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Consumer hook for user context.
 *
 * Throws when called outside `<UserProvider>` so integration errors fail fast
 * during development instead of producing undefined behavior at runtime.
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    // Explicit runtime guard to catch integration mistakes early.
    throw new Error('useUser must be used within a UserProvider.');
  }

  return context;
}
