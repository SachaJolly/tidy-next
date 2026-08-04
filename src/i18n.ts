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
 *   locales/{locale}/ListCard.json (PascalCase for components/pages)
 *   locales/{locale}/ListPage.json (PascalCase for components/pages)
 *   ...etc
 *
 * Namespace convention:
 *   - Lowercase for global domains: auth, common, navbar, footer, forms, dashboard, etc.
 *   - PascalCase for component/page namespaces: AccountDropdown, ListCard, ListPage, etc.
 *
 * The filename (without .json) is used directly as the namespace key.
 * No conversion needed — consistency across files and components.
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
      const namespaceName = file.replace('.json', '');
      const filePath = join(localeDir, file);

      try {
        const raw = readFileSync(filePath, 'utf8');
        const moduleMessages = JSON.parse(raw) as Record<string, unknown>;

        // Use the filename (without extension) directly as the namespace key.
        // No conversion needed: lowercase filenames stay lowercase,
        // PascalCase filenames stay PascalCase.
        messages[namespaceName] = moduleMessages;
      } catch (error) {
        console.error(
          `Failed to load translation module "${namespaceName}" for locale "${locale}":`,
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
