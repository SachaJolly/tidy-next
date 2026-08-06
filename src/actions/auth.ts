'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, ApiFetchError } from '@/lib/api';
import { LOGIN_REDIRECT_EXCEPTIONS } from '@/lib/auth-routes';
import { User } from '@/lib/types';
import { LANGUAGE_COOKIE_NAME, LANGUAGE_COOKIE_MAX_AGE } from '@/lib/language-mapper';
import { saveLanguagePreference } from './language';

type AuthActionResult = {
  error?: string;
  redirectTo?: string;
  userLanguage?: string; // Language from authenticated user's DB profile
};

function isValidCallbackUrl(value: string | undefined): value is string {
  return !!value && value.startsWith('/');
}

function resolvePostAuthRedirect(callbackUrl?: string): string {
  const isRedirectException = LOGIN_REDIRECT_EXCEPTIONS.some((path) => path === callbackUrl);

  if (!isValidCallbackUrl(callbackUrl) || isRedirectException) {
    return '/dashboard';
  }

  return callbackUrl;
}

async function setSessionCookies(token: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set('tidy_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signinAction(
  email: string,
  password: string,
  callbackUrl?: string,
): Promise<AuthActionResult> {
  try {
    const { data, headers } = await api.public.postWithHeaders<{ user: User }>(
      '/api/v1/login',
      {
        user: { email, password },
      },
      { cache: 'no-store' },
    );

    const authHeader = headers.get('Authorization');
    if (!authHeader || !data?.user) {
      return { error: 'Login succeeded but no token or user was returned.' };
    }

    // Set auth token cookie
    await setSessionCookies(authHeader);

    // CRITICAL: Sync user's database language preference to cookie.
    // This ensures that if the user was using a different language on another device,
    // they immediately see their saved language preference after login.
    // Priority: DB language > previous cookie language
    if (data.user.language === 'en' || data.user.language === 'fr') {
      await saveLanguagePreference(data.user.language);
    }

    revalidatePath('/', 'layout');

    // BUG FIX 1: Return the user's language so client can use correct locale for redirect
    // This fixes race condition where client-side router.push() used stale useLocale() hook
    return { 
      redirectTo: resolvePostAuthRedirect(callbackUrl),
      // Only return language if it's valid (en or fr), otherwise undefined
      userLanguage: (data.user.language === 'en' || data.user.language === 'fr') 
        ? data.user.language 
        : undefined
    };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred.' };
  }
}

export async function signupAction(
  username: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  callbackUrl?: string,
): Promise<AuthActionResult> {
  try {
    // Read language preference from cookie (if set by LanguageInitializer or by guest)
    const cookieStore = await cookies();
    const preferredLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value ?? 'en';

    const { data, headers } = await api.public.postWithHeaders<{ user: User }>(
      '/api/v1/signup',
      {
        user: {
          username,
          email,
          password,
          password_confirmation: passwordConfirmation,
          language: preferredLanguage, // Initialize with user's language preference
        },
      },
      { cache: 'no-store' },
    );

    const authHeader = headers.get('Authorization');
    if (!authHeader || !data?.user) {
      return { error: 'Signup succeeded but no token or user data was received.' };
    }

    // Set auth token cookie
    await setSessionCookies(authHeader);

    // Sync language from response to ensure consistency between DB and cookie.
    // The backend should return the user.language that was just created.
    if (data.user.language === 'en' || data.user.language === 'fr') {
      await saveLanguagePreference(data.user.language);
    }

    revalidatePath('/', 'layout');

    return { redirectTo: resolvePostAuthRedirect(callbackUrl) };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred.' };
  }
}

/**
 * Atomically clears the session and redirects to the public root route.
 *
 * WHY SERVER-SIDE REDIRECT?
 * Bundling cookie deletion + redirect in one server response avoids transient
 * states where the client UI is still on a protected page after logout.
 *
 * The important part is the `revalidatePath('/', 'layout')` call: it purges
 * the cached root layout so the server-rendered navbar immediately reflects
 * the new auth state on the next navigation.
 *
 * LANGUAGE COOKIE PRESERVATION:
 * We intentionally DO NOT delete the tidy_language cookie. This ensures:
 * - User remains on their preferred language after logout
 * - Language preference persists across logout/login cycles
 * - When they return as a guest, they see the same language
 * - Next login will sync DB language, overriding this cookie if needed
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  // Delete auth tokens but preserve language preference
  cookieStore.delete('tidy_token');
  cookieStore.delete('tidy_user');
  // Intentionally NOT deleting tidy_language - it persists after logout

  revalidatePath('/', 'layout');
  redirect('/');
}
