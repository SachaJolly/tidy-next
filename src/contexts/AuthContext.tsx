"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';
import Cookies from 'js-cookie';
import { logoutAction } from '@/app/actions/auth';

/**
 * 1. DEFINE THE SHAPE OF THE CONTEXT
 * This interface describes all the values and functions that our context will provide
 * to any component that uses it.
 */
interface AuthContextType {
  user: User | null;          // The currently logged-in user object, or null if not logged in.
  token: string | null;         // The JWT token.
  isAuthenticated: boolean;   // A simple boolean flag for quick checks.
  isLoading: boolean;           // True while the context is trying to load auth state from cookies.
  login: (token: string, user: User) => void; // Function to handle successful login.
  logout: () => void;         // Function to handle logout.
}

/**
 * 2. CREATE THE CONTEXT
 * We create the context with `undefined` as the default value.
 * This helps us ensure that we never try to use the context outside of its provider.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 3. CREATE THE PROVIDER COMPONENT
 * This component will wrap our entire application (or parts of it) and provide
 * the auth state and functions to all children.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // This effect runs once when the application first loads on the client.
  useEffect(() => {
    // Try to find the token and user info that might have been saved in cookies.
    const savedToken = Cookies.get('tidy_token');
    const savedUser = Cookies.get('tidy_user');

    if (savedToken && savedUser) {
      // If we find them, we restore the session.
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Whether we found a session or not, we are done loading.
    setIsLoading(false);
  }, []);

  /**
   * Persists the session to cookies. Post-login routing is handled by the
   * calling page component, which has direct access to the URL's callbackUrl
   * search parameter and the exception list.
   */
  const login = (newToken: string, newUser: User) => {
    setUser(newUser);
    setToken(newToken);

    const isProduction = process.env.NODE_ENV === 'production';

    // Store the token and user info in browser cookies.
    // `expires: 7` means the cookie will last for 7 days.
    // `secure: true` is an important security measure for production.
    Cookies.set('tidy_token', newToken, { expires: 7, secure: isProduction, sameSite: 'strict' });
    Cookies.set('tidy_user', JSON.stringify(newUser), { expires: 7, secure: isProduction, sameSite: 'strict' });
  };

  /**
   * Calls the logoutAction Server Action, which atomically clears session
   * cookies and conditionally redirects — all in one HTTP response.
   * See src/app/actions/auth.ts for the full race-condition analysis.
   *
   * The .then() branch only executes on public pages: for protected pages,
   * logoutAction calls redirect() on the server, so the browser navigates
   * away before this Promise resolves on the client.
   */
  const logout = () => {
    logoutAction(pathname)
      .then(() => {
        // Reached only on public pages — clear local React state and refresh
        // server components (Navbar, etc.) without a full page reload.
        setUser(null);
        setToken(null);
        Cookies.remove('tidy_token');
        Cookies.remove('tidy_user');
        router.refresh();
      })
      .catch(() => {
        // Server Action failed (e.g. network error). Fall back to client-side
        // cleanup so the user is never left in a broken auth state.
        setUser(null);
        setToken(null);
        Cookies.remove('tidy_token');
        Cookies.remove('tidy_user');
        router.refresh();
      });
  };

  // The value object that will be provided to all consuming components.
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 4. CREATE A CUSTOM HOOK
 * This is a quality-of-life improvement. Instead of components needing to import
 * `useContext` and `AuthContext` every time, they can just use this simple hook.
 * @example
 * const { isAuthenticated, user, login } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is a safeguard. It will be thrown if you try to use `useAuth()`
    // in a component that is not a child of <AuthProvider>.
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
