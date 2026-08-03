import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, routing, type Locale } from './i18n-routing';

const localesDir = join(process.cwd(), 'locales');

function loadMessages(locale: Locale) {
  const filePath = join(localesDir, `${locale}.json`);
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

/**
 * Next-intl request config.
 *
 * The locale comes from the middleware-selected request context, and the
 * messages are loaded on demand so the app stays server-rendered by default.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const normalizedLocale = (
    routing.locales.includes(locale as Locale) ? locale : defaultLocale
  ) as Locale;

  return {
    locale: normalizedLocale,
    messages: loadMessages(normalizedLocale),
  };
});
