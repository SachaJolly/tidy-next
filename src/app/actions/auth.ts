'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { api, ApiFetchError } from '@/lib/api';
import { LOGIN_REDIRECT_EXCEPTIONS } from '@/lib/auth-routes';
import { User } from '@/lib/types';

type AuthActionResult = {
  error?: string;
  redirectTo?: string;
};

function isValidCallbackUrl(value: string | undefined): value is string {
  return !!value && value.startsWith('/');
}

function resolvePostAuthRedirect(callbackUrl?: string): string {
  if (!isValidCallbackUrl(callbackUrl) || LOGIN_REDIRECT_EXCEPTIONS.includes(callbackUrl as any)) {
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

    await setSessionCookies(authHeader);
    revalidatePath('/', 'layout');

    return { redirectTo: resolvePostAuthRedirect(callbackUrl) };
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
    const { data, headers } = await api.public.postWithHeaders<{ user: User }>(
      '/api/v1/signup',
      {
        user: {
          username,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      },
      { cache: 'no-store' },
    );

    const authHeader = headers.get('Authorization');
    if (!authHeader || !data?.user) {
      return { error: 'Signup succeeded but no token or user data was received.' };
    }

    await setSessionCookies(authHeader);
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
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('tidy_token');
  cookieStore.delete('tidy_user');

  revalidatePath('/', 'layout');
  redirect('/');
}
