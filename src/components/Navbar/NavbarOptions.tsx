'use client';

import React, { useState } from 'react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

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
import packageJson from '@/../package.json';
import { changeLanguage } from '@/actions/language';
import { changeTheme } from '@/actions/theme';
import { logoutAction } from '@/actions/auth';
import { useUserPreference } from '@/hooks/useUserPreference';
import { localizePath } from '@/lib/locale-path';
import { useUser } from '@/providers/UserProvider';
import { type LanguagePreference, LANGUAGE_OPTIONS } from '@/lib/language-mapper';
import { type ThemePreference, THEME_OPTIONS } from '@/lib/theme-mapper';
import { formatTimezoneLabel } from '@/lib/timezone-mapper';

const MOCK_ACCOUNTS = [
  { value: 'vivianne', label: 'Vivianne', caption: 'vivianne.lebrec@gmail.com' },
  { value: 'alexandra', label: 'Alexandra', caption: 'alex.sacha.jolly@gmail.com' },
];

interface NavbarOptionsProps {
  initialLanguage?: LanguagePreference;
  initialTheme?: ThemePreference;
  initialTimezone?: string | null;
  inline?: boolean;
}

export default function NavbarOptions({
  initialLanguage,
  initialTheme,
  initialTimezone,
  inline,
}: NavbarOptionsProps) {
  const { user } = useUser();
  const t = useTranslations('NavbarOptions');
  const date = useTranslations('date');
  const common = useTranslations('common');
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const releaseDate = process.env.NEXT_PUBLIC_RELEASE_DATE;
  const [activeAccount, setActiveAccount] = useState(MOCK_ACCOUNTS[1]?.value ?? '');

  // The authenticated user wins, but the props remain as safe fallbacks so the
  // menu can still render in Storybook or guest contexts without extra wiring.
  const resolvedLanguage = user?.language === 'fr' ? 'fr' : initialLanguage ?? 'en';
  const resolvedTheme = user?.theme ? (user.theme.toLowerCase() as ThemePreference) : initialTheme ?? 'system';
  const resolvedTimezone = user?.timezone ?? initialTimezone ?? null;

  const { value: language, handleChange: handleLanguageChange } = useUserPreference(
    resolvedLanguage,
    changeLanguage,
    'language',
  );

  const { value: theme, handleChange: handleThemeChange } = useUserPreference(
    resolvedTheme,
    changeTheme,
    'theme',
  );

  const currentLanguageLabel = common(`language.${language}`);
  const currentThemeLabel = common(`theme.${theme}`);

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  return (
    <DropdownMenu align="end" inline={inline}>
      {user && (
        <>
          <DropdownItem icon="subscription" label={t('proTitle')} caption={t('proCaption')} />
          <DropdownSeparator />
          <DropdownItem icon="settings" href={localizePath('/settings', locale)}>
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
              <DropdownItem icon="logout" destructive onSelect={() => void handleLogout()}>
                {t('signOut')}
              </DropdownItem>
            </DropdownSubContent>
          </DropdownSub>
          <DropdownItem icon="logout" destructive onSelect={() => void handleLogout()}>
            {t('signOut')}
          </DropdownItem>
          <DropdownSeparator />
        </>
      )}

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
              <DropdownRadioItem
                key={themeOption}
                value={themeOption}
                label={common(`theme.${themeOption}`)}
              />
            ))}
            <DropdownSeparator />
            <DropdownText>
              <p className="text-small">{t('appliesToYourAccount')}</p>
            </DropdownText>
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

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

      {user && (
        <>
          <DropdownItem icon="public" href={localizePath('/settings/preferences', locale)}>
            {t('timezone')}: {formatTimezoneLabel(resolvedTimezone)}
          </DropdownItem>
          <DropdownItem icon="info">{t('cookiePreferences')}</DropdownItem>
        </>
      )}

      <DropdownSeparator />
      <DropdownItem icon="new">{t('updates')}</DropdownItem>
      <DropdownItem
        icon="help"
        label={t('helpCenter')}
        href="#"
        //target="_blank"
        rel="noreferrer"
      />
      <DropdownSeparator />

      <DropdownText>
        <p className="text-small">{t('version', { version: packageJson.version })}</p>
        {releaseDate && (
          <p className="text-small">
            {date('releasedOn', {
              date: format.dateTime(new Date(releaseDate), 'long'),
            })}
          </p>
        )}
      </DropdownText>
    </DropdownMenu>
  );
}
