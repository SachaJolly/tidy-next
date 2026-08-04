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
} from '@/components/dropdown';
import Avatar from '@/components/avatar/avatar';
import type { User } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { localizePath } from '@/lib/locale-path';

// Mock accounts — replace with real data from auth/API when available.
const MOCK_ACCOUNTS = [
  { value: 'vivianne', label: 'Vivianne', caption: 'vivianne.lebrec@gmail.com' },
  { value: 'alexandra', label: 'Alexandra', caption: 'alex.sacha.jolly@gmail.com' },
];

type Language = 'english' | 'german' | 'french' | 'russian' | 'spanish';
type Theme = 'system' | 'dark' | 'light';

interface AccountDropdownProps {
  /** Null when the user is not authenticated. */
  user: User | null;
  onLogout: () => void | Promise<void>;
  /**
   * Renders the panel inline (no portal, no fixed positioning).
   * Pass this in Storybook stories to display the menu directly in the canvas.
   */
  inline?: boolean;
}

/** Renders only the <DropdownMenu> panel — mount inside <Dropdown> in the parent. */
export function AccountDropdown({ user, onLogout, inline }: AccountDropdownProps) {
  const t = useTranslations('AccountDropdown');
  const common = useTranslations('common');
  const locale = useLocale();
  const [language, setLanguage] = useState<Language>('english');
  const [theme, setTheme] = useState<Theme>('system');
  const [activeAccount, setActiveAccount] = useState(MOCK_ACCOUNTS[1]?.value ?? '');

  const languageOptions = [
    { value: 'english', label: common('english') },
    { value: 'german', label: common('german') },
    { value: 'french', label: common('french') },
    { value: 'russian', label: common('russian') },
    { value: 'spanish', label: common('spanish') },
  ] as const;

  const themeOptions = [
    { value: 'system', label: common('system') },
    { value: 'dark', label: common('dark') },
    { value: 'light', label: common('light') },
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
            onValueChange={(v) => setLanguage(v as Language)}
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
        <p className="text-small">{t('version')}</p>
        <p className="text-small">{t('publishedOn')}</p>
      </DropdownText>
    </DropdownMenu>
  );
}
