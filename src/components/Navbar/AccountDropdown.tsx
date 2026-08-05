'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { type Language } from '@/lib/language-mapper';
import { changeLanguage } from '@/app/actions/language';

// Mock accounts — replace with real data from auth/API when available.
const MOCK_ACCOUNTS = [
  { value: 'vivianne', label: 'Vivianne', caption: 'vivianne.lebrec@gmail.com' },
  { value: 'alexandra', label: 'Alexandra', caption: 'alex.sacha.jolly@gmail.com' },
];

type Theme = 'system' | 'dark' | 'light';

interface AccountDropdownProps {
  /** Null when the user is not authenticated. */
  user: User | null;
  /** User's preferred language (from DB if authenticated, or cookie/browser default). */
  initialLanguage: Language;
  onLogout: () => void | Promise<void>;
  /**
   * Renders the panel inline (no portal, no fixed positioning).
   * Pass this in Storybook stories to display the menu directly in the canvas.
   */
  inline?: boolean;
}

/** Renders only the <DropdownMenu> panel — mount inside <Dropdown> in the parent. */
export function AccountDropdown({ user, initialLanguage, onLogout, inline }: AccountDropdownProps) {
  const t = useTranslations('AccountDropdown');
  const date = useTranslations('date');
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const releaseDate = process.env.NEXT_PUBLIC_RELEASE_DATE;
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [theme, setTheme] = useState<Theme>('system');
  const [activeAccount, setActiveAccount] = useState(MOCK_ACCOUNTS[1]?.value ?? '');

  // BUG D FIX: keep local state in sync with the server-resolved language.
  // `initialLanguage` comes from a parent Server Component (NavbarAuthContent),
  // which is re-evaluated on every router.refresh()/navigation. Without this
  // effect, a reconciliation elsewhere (e.g. middleware syncing DB -> cookie
  // after a change made on another device) would update `initialLanguage` on
  // the server, but this component's local `useState` would keep showing the
  // stale value since it only reads its initial value once on mount.
  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  // Handle language change following the DB-first hierarchy (see changeLanguage()):
  // - Authenticated: DB is updated first, cookie only synced on success.
  // - Guest: cookie is updated directly.
  // The local `language` state is updated optimistically for instant UI feedback,
  // then reverted if the persistence call fails so the UI never lies about what
  // was actually saved.
  const handleLanguageChange = async (newLanguage: Language) => {
    const previousLanguage = language;
    setLanguage(newLanguage);

    try {
      await changeLanguage(newLanguage);
      // Refresh server components (Navbar, layout messages) with new language
      // router.refresh() is preferred over window.location.href for better UX
      router.refresh();
    } catch (error) {
      console.error('[AccountDropdown] failed to change language:', error);
      setLanguage(previousLanguage);
    }
  };

  const languageOptions = [
    { value: 'en' as const, label: common('language.en') },
    { value: 'fr' as const, label: common('language.fr') },
  ] as const;

  const themeOptions = [
    { value: 'system', label: common('theme.system') },
    { value: 'dark', label: common('theme.dark') },
    { value: 'light', label: common('theme.light') },
  ] as const;

  const currentLanguage = languageOptions.find((l) => l.value === language)!;
  const currentTheme = themeOptions.find((t) => t.value === theme)!;

  return (
    <DropdownMenu align="end" inline={inline}>
      <DropdownItem icon="subscription" label={t('proTitle')} caption={t('proCaption')} />

      <DropdownSeparator />

      {/* Account section — content differs based on auth state */}
      {user && (
        <>
          <DropdownItem icon="settings" href={localizePath(`/${user.username}/settings`, locale)}>
            {t('account')}
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
          {t('language')}: {currentLanguage.label}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup
            value={language}
            onValueChange={(v) => void handleLanguageChange(v as Language)}
            label={t('language')}
            closeOnSelect
          >
            {languageOptions.map(({ value, label }) => (
              <DropdownRadioItem key={value} value={value} label={label} />
            ))}
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

      <DropdownSub id="theme">
        <DropdownSubTrigger icon="dark_mode" title={t('theme')}>
          {t('theme')}: {currentTheme.label}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup
            value={theme}
            onValueChange={(v) => setTheme(v as Theme)}
            label={t('theme')}
            closeOnSelect
          >
            {themeOptions.map(({ value, label }) => (
              <DropdownRadioItem key={value} value={value} label={label} />
            ))}
            <DropdownSeparator />
            <DropdownText>
              <p className="text-small">{t('appliesToYourAccount')}</p>
            </DropdownText>
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

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
