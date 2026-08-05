'use client';

import { useEffect } from 'react';
import { LANGUAGE_COOKIE_NAME } from '@/lib/language-mapper';

/**
 * Client-side component that ensures tidy_language cookie exists.
 * If the cookie is missing, creates it with the current locale.
 * 
 * This is a workaround for the middleware not properly setting cookies
 * in some environments.
 */
export function LanguageInitializer({ locale }: { locale: string }) {
  useEffect(() => {
    // Check if cookie exists
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${LANGUAGE_COOKIE_NAME}=`))
      ?.split('=')[1];

    // If cookie doesn't exist, create it
    if (!cookieValue) {
      const maxAge = 365 * 24 * 60 * 60; // 1 year
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  }, [locale]);

  return null;
}
