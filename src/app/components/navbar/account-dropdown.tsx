"use client";

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
} from '@/app/components/dropdown';
import Avatar from '@/app/components/avatar/avatar';
import Icon from '@/app/components/icon/icon';
import type { User } from '@/lib/types';

// Mock accounts — replace with real data from auth/API when available.
const MOCK_ACCOUNTS = [
  { value: 'vivianne', label: 'Vivianne',  caption: 'vivianne.lebrec@gmail.com' },
  { value: 'alexandra', label: 'Alexandra', caption: 'alex.sacha.jolly@gmail.com' },
];

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'german',  label: 'German - Deutsch' },
  { value: 'french',  label: 'French - Français' },
  { value: 'russian', label: 'Russian - Русский' },
  { value: 'spanish', label: 'Spanish - Español' },
] as const;

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'dark',   label: 'Dark' },
  { value: 'light',  label: 'Light' },
] as const;

type Language = (typeof LANGUAGES)[number]['value'];
type Theme    = (typeof THEMES)[number]['value'];

interface AccountDropdownProps {
  /** Null when the user is not authenticated. */
  user: User | null;
  onLogout: () => void;
  /**
   * Renders the panel inline (no portal, no fixed positioning).
   * Pass this in Storybook stories to display the menu directly in the canvas.
   */
  inline?: boolean;
}

/** Renders only the <DropdownMenu> panel — wrap with <Dropdown> + <DropdownTrigger> in the parent. */
export function AccountDropdown({ user, onLogout, inline }: AccountDropdownProps) {
  const [language, setLanguage] = useState<Language>('english');
  const [theme,    setTheme]    = useState<Theme>('system');
  const [activeAccount, setActiveAccount] = useState(MOCK_ACCOUNTS[1]?.value ?? '');

  const currentLanguage = LANGUAGES.find(l => l.value === language)!;
  const currentTheme    = THEMES.find(t => t.value === theme)!;

  return (
    <DropdownMenu align="end" inline={inline}>

      <DropdownItem icon="subscription" label="Get TidyCards Pro" caption="Unlock new features like stats and more collections" />

      <DropdownSeparator />

      {/* Account section — content differs based on auth state */}
      {user && (
        <>
          <DropdownItem icon="settings" href={`/${user.username}/settings`}>Account</DropdownItem>
          <DropdownSub id="switch-account">
            <DropdownSubTrigger icon="switch_account" title="Switch account">
              Switch account
            </DropdownSubTrigger>
            <DropdownSubContent>
              {MOCK_ACCOUNTS.length > 0 && (
                <>
                  <DropdownRadioGroup
                    value={activeAccount}
                    onValueChange={setActiveAccount}
                    label="Accounts"
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
              <DropdownItem icon="person_add">Add account</DropdownItem>
              <DropdownItem icon="logout" destructive onSelect={() => onLogout()}>Sign out</DropdownItem>

            </DropdownSubContent>
          </DropdownSub>

          <DropdownItem icon="logout" destructive onSelect={() => onLogout()}>Sign out</DropdownItem>

          <DropdownSeparator />
        </>
      )}

      {/* Preferences */}
      <DropdownSub id="language">
        <DropdownSubTrigger icon="language" title="Language">
          Language: {currentLanguage.label}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup value={language} onValueChange={v => setLanguage(v as Language)} label="Language" closeOnSelect>
            {LANGUAGES.map(({ value, label }) => (
              <DropdownRadioItem key={value} value={value} label={label} />
            ))}
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

      <DropdownSub id="theme">
        <DropdownSubTrigger icon="dark_mode" title="Theme">
          Theme: {currentTheme.label}
        </DropdownSubTrigger>
        <DropdownSubContent>
          <DropdownRadioGroup value={theme} onValueChange={v => setTheme(v as Theme)} label="Theme" closeOnSelect>
            {THEMES.map(({ value, label }) => (
              <DropdownRadioItem key={value} value={value} label={label} />
            ))}
            <DropdownSeparator />
            <DropdownText>
              <p className="text-small">Applies to your account</p>
            </DropdownText>
          </DropdownRadioGroup>
        </DropdownSubContent>
      </DropdownSub>

      <DropdownItem icon="info">Cookie preferences</DropdownItem>

      <DropdownSeparator />

      {/* Help */}
      <DropdownItem icon="new">What&apos;s new?</DropdownItem>
      <DropdownItem icon="flag">Send feedback</DropdownItem>
      <DropdownItem icon="help" label="Help center" href="https://help.tidycards.app" target="_blank" rel="noreferrer" />
      <DropdownSeparator />

      <DropdownText>
        <p className="text-small">TidyCards v1.0.0</p>
        <p className="text-small">Published on July 30, 2026</p>
      </DropdownText>

    </DropdownMenu>
  );
}
