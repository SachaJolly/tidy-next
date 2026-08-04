import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, routing, type Locale } from './i18n-routing';

const localesDir = join(process.cwd(), 'locales');

/**
 * Dynamically loads and merges all modular translation files for a given locale.
 *
 * File structure:
 *   locales/{locale}/common.json
 *   locales/{locale}/auth.json
 *   locales/{locale}/navbar.json
 *   ...etc
 *
 * Each file is parsed as JSON and merged into a flat namespace object:
 *   {
 *     "common": {...},
 *     "auth": {...},
 *     "navbar": {...}
 *   }
 *
 * If a module file is missing, it's silently skipped (fallback behavior).
 * This allows gradual migration of translation modules.
 */
function loadMessages(locale: Locale): Record<string, unknown> {
  const localeDir = join(localesDir, locale);
  const messages: Record<string, unknown> = {};

  try {
    // List all JSON files in the locale directory
    const files = readdirSync(localeDir).filter((file) =>
      file.endsWith('.json')
    );

    // Load and merge each translation module
    files.forEach((file) => {
      const moduleName = file.replace('.json', '');
      const filePath = join(localeDir, file);

      try {
        const raw = readFileSync(filePath, 'utf8');
        const moduleMessages = JSON.parse(raw) as Record<string, unknown>;

        // Merge module into the main messages object.
        // The namespace key (module name) can be used to organize translations hierarchically
        // if needed, but for now we spread them at the top level for backward compatibility.
        messages[moduleName] = moduleMessages;
      } catch (error) {
        console.error(
          `Failed to load translation module "${moduleName}" for locale "${locale}":`,
          error
        );
      }
    });
  } catch (error) {
    console.error(`Failed to read locale directory "${localeDir}":`, error);
  }

  return messages;
}

/**
 * Next-intl request config with modular translation loading.
 *
 * The locale comes from the middleware-selected request context, and the
 * messages are loaded on demand so the app stays server-rendered by default.
 *
 * Translations are organized into domain-specific files (common, auth, navbar, etc.)
 * and dynamically merged at request time. This improves maintainability and allows
 * teams to own specific translation namespaces independently.
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
