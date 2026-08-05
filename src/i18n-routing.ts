import { defineRouting } from 'next-intl/routing';
import { LANGUAGE_COOKIE_NAME, toLocale, type Language } from '@/lib/language-mapper';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'never',
});

function parseAcceptLanguage(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map((entry) => {
      const [tag, qualityPart] = entry.trim().split(';q=');
      const quality = qualityPart ? Number(qualityPart) : 1;

      return { tag: tag.toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter(({ tag }) => tag.length > 0)
    .sort((a, b) => b.quality - a.quality)
    .map(({ tag }) => tag);
}

function matchLocale(candidate: string): Locale | null {
  const normalizedCandidate = candidate.toLowerCase().replace('_', '-');

  if (locales.includes(normalizedCandidate as Locale)) {
    return normalizedCandidate as Locale;
  }

  const baseLanguage = normalizedCandidate.split('-')[0];
  return locales.find((locale) => locale.split('-')[0] === baseLanguage) ?? null;
}

export function resolveLocaleFromRequest(options: {
  pathnameLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  const { pathnameLocale, cookieLocale, acceptLanguage } = options;

  // Priority 1: Pathname locale (explicit in URL)
  const fromPathname = pathnameLocale ? matchLocale(pathnameLocale) : null;
  if (fromPathname) {
    return fromPathname;
  }

  // Priority 2: Cookie locale (user's saved preference, persists when logged out)
  const fromCookie = cookieLocale ? matchLocale(cookieLocale) : null;
  if (fromCookie) {
    return fromCookie;
  }

  // Priority 3: Browser's Accept-Language header
  const preferredLocales = acceptLanguage ? parseAcceptLanguage(acceptLanguage) : [];
  for (const preferredLocale of preferredLocales) {
    const matchedLocale = matchLocale(preferredLocale);
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  // Priority 4: Default locale
  return defaultLocale;
}
