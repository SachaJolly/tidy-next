'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubTrigger,
  DropdownSubContent,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownText,
} from '@/components/Dropdown';
import Avatar from '@/components/Avatar/Avatar';
import type { User } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { localizePath } from '@/lib/locale-path';
import { formatDate } from '@/lib/date';
import packageJson from '@/../package.json';
import { type LanguagePreference, LANGUAGE_OPTIONS } from '@/lib/language-mapper';
import { type ThemePreference, THEME_OPTIONS } from '@/lib/theme-mapper';
import { formatTimezoneLabel } from '@/lib/timezone-mapper';
import { changeLanguage } from '@/app/actions/language';
import { changeTheme } from '@/app/actions/theme';
import { useUserPreference } from '@/hooks/useUserPreference';

// Mock accounts — replace with real data from auth/API when available.
const MOCK_ACCOUNTS = [
  { value: 'vivianne', label: 'Vivianne', caption: 'vivianne.lebrec@gmail.com' },
  { value: 'alexandra', label: 'Alexandra', caption: 'alex.sacha.jolly@gmail.com' },
];

interface AccountDropdownProps {
  /** Null when the user is not authenticated. */
  user: User | null;
  /** User's preferred language (from DB if authenticated, or cookie/browser default). */
  initialLanguage: LanguagePreference;
  /** User's preferred theme (from DB if authenticated, or cookie default). */
  initialTheme: ThemePreference;
  /**
   * User's preferred timezone as an IANA string (e.g. "Europe/Paris").
   * Null means "Auto" — not explicitly set, the settings page shows Auto.
   */
  initialTimezone: string | null;
  onLogout: () => void | Promise<void>;
  /**
   * Renders the panel inline (no portal, no fixed positioning).
   * Pass this in Storybook stories to display the menu directly in the canvas.
   */
  inline?: boolean;
}

/** Renders only the <DropdownMenu> panel — mount inside <Dropdown> in the parent. */
export function AccountDropdown({ user, initialLanguage, initialTheme, initialTimezone, onLogout, inline }: AccountDropdownProps) {
  const t = useTranslations('AccountDropdown');
  const date = useTranslations('date');
  const common = useTranslations('common');
  const locale = useLocale();
  const releaseDate = process.env.NEXT_PUBLIC_RELEASE_DATE;
  const [activeAccount, setActiveAccount] = useState(MOCK_ACCOUNTS[1]?.value ?? '');

  const { value: language, handleChange: handleLanguageChange } = useUserPreference(
    initialLanguage,
    changeLanguage,
    'language',
  );

  const { value: theme, handleChange: handleThemeChange } = useUserPreference(
    initialTheme,
    changeTheme,
    'theme',
  );

  const currentLanguageLabel = common(`language.${language}`);
  const currentThemeLabel = common(`theme.${theme}`);

  return (
    <DropdownMenu align="end" inline={inline}>
      <DropdownItem icon="subscription" label={t('proTitle')} caption={t('proCaption')} />

      <DropdownSeparator />

      {/* Account section — content differs based on auth state */}
      {user && (
        <>
          <DropdownItem icon="settings" href={localizePath('/settings/preferences', locale)}>
            {t('settings')}
          </DropdownItem>
          <DropdownSub id="switch-account">
            <DropdownSubTrigger icon="switch_account" title={t('switchAccount')}>
              {t('switchAccount')}
            </DropdownSubTrigger>
            <DropdownSubContent>
              {MOCK_ACCOUNTS.length > 0 && (
                <>
                  <DropdownRadioGroup
                    value={activeAccount}
                    onValueChange={setActiveAccount}
                    label={t('accounts')}
                    closeOnSelect
                  >
                    {MOCK_ACCOUNTS.map(({ value, label, caption }) => (
                      <DropdownRadioItem
                        key={value}
                        value={value}
                        label={label}
                        caption={caption}
                        prefix={<Avatar initials={label.charAt(0)} size="32" alt={label} />}
                      />
                    ))}
                  </DropdownRadioGroup>
                  <DropdownSeparator />
                </>
              )}
              <DropdownItem icon="person_add">{t('addAccount')}</DropdownItem>
              <DropdownItem icon="logout" destructive onSelect={() => void onLogout()}>
                {t('signOut')}
              </DropdownItem>
            </DropdownSubContent>
          </DropdownSub>

          <DropdownItem icon="logout" destructive onSelect={() => void onLogout()}>
            {t('signOut')}
          </DropdownItem>

          <DropdownSeparator />
        </>
      )}

      {/* Preferences */}
      <DropdownSub id="language">
        <DropdownSubTrigger icon="language" title={t('language')}>
          {t('language')}: {currentLanguageLabel}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup
            value={language}
            onValueChange={(v) => void handleLanguageChange(v as LanguagePreference)}
            label={t('language')}
            closeOnSelect={false}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <DropdownRadioItem key={lang} value={lang} label={common(`language.${lang}`)} />
            ))}
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

      <DropdownSub id="theme">
        <DropdownSubTrigger icon="dark_mode" title={t('theme')}>
          {t('theme')}: {currentThemeLabel}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup
            value={theme}
            onValueChange={(v) => void handleThemeChange(v as ThemePreference)}
            label={t('theme')}
            closeOnSelect={false}
          >
            {THEME_OPTIONS.map((themeOption) => (
              <DropdownRadioItem key={themeOption} value={themeOption} label={common(`theme.${themeOption}`)} />
            ))}
            <DropdownSeparator />
            <DropdownText>
              <p className="text-small">{t('appliesToYourAccount')}</p>
            </DropdownText>
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

      {/* Timezone — no inline submenu; too many options. Links directly to settings/preferences. */}
      <DropdownItem
        icon="public"
        href={localizePath('/settings/preferences', locale)}
      >
        {t('timezone')}: {formatTimezoneLabel(initialTimezone)}
      </DropdownItem>

      <DropdownItem icon="info">{t('cookiePreferences')}</DropdownItem>

      <DropdownSeparator />

      {/* Help */}
      <DropdownItem icon="new">{t('whatsNew')}</DropdownItem>
      <DropdownItem icon="flag">{t('sendFeedback')}</DropdownItem>
      <DropdownItem
        icon="help"
        label={t('helpCenter')}
        href="https://help.tidycards.app"
        target="_blank"
        rel="noreferrer"
      />
      <DropdownSeparator />

      <DropdownText>
        <p className="text-small">{t('version', { version: packageJson.version })}</p>
        {releaseDate && (
          <p className="text-small">
            {date('publishedOn', {
              date: formatDate(releaseDate, locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
            })}
          </p>
        )}
      </DropdownText>
    </DropdownMenu>
  );
}
