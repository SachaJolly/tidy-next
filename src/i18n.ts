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
 *   locales/{locale}/account-dropdown.json (kebab-case)
 *   locales/{locale}/list-card.json (kebab-case)
 *   ...etc
 *
 * Namespace key conversion logic:
 *   - Page/domain files (no hyphens or ending with '-page'): keep lowercase with hyphens
 *     Examples: auth, common, list-page, dashboard → 'auth', 'common', 'list-page', 'dashboard'
 *   - Component/modal files (contain hyphens, not '-page'): convert to PascalCase
 *     Examples: account-dropdown, list-card → 'AccountDropdown', 'ListCard'
 *
 * If a module file is missing, it's silently skipped (fallback behavior).
 * This allows gradual migration of translation modules.
 */
function loadMessages(locale: Locale): Record<string, unknown> {
  const localeDir = join(localesDir, locale);
  const messages: Record<string, unknown> = {};

  // Explicit mapping for files that should keep kebab-case naming
  // (page-level domains where the hyphen is intentional)
  const kebabCaseFiles = new Set(['list-page']);

  try {
    // List all JSON files in the locale directory
    const files = readdirSync(localeDir).filter((file) =>
      file.endsWith('.json')
    );

    // Load and merge each translation module
    files.forEach((file) => {
      const fileBaseName = file.replace('.json', '');
      const filePath = join(localeDir, file);

      try {
        const raw = readFileSync(filePath, 'utf8');
        const moduleMessages = JSON.parse(raw) as Record<string, unknown>;

        // Convert filename to namespace key.
        // Special cases:
        //   - Single-word names (no hyphens) stay lowercase: auth → 'auth'
        //   - Explicitly-marked kebab-case files stay as-is: list-page → 'list-page'
        //   - Other hyphenated names convert to PascalCase: account-dropdown → 'AccountDropdown'
        let namespaceName = fileBaseName;
        
        if (!fileBaseName.includes('-')) {
          // Single-word files: keep as lowercase (auth, common, dashboard, etc.)
          namespaceName = fileBaseName;
        } else if (kebabCaseFiles.has(fileBaseName)) {
          // Explicit kebab-case files: keep as-is (list-page)
          namespaceName = fileBaseName;
        } else {
          // Multi-word component/modal files: convert to PascalCase
          // account-dropdown → AccountDropdown, list-card → ListCard
          namespaceName = fileBaseName
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
        }

        messages[namespaceName] = moduleMessages;
      } catch (error) {
        console.error(
          `Failed to load translation module "${fileBaseName}" for locale "${locale}":`,
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
