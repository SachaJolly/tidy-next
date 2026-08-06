'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import { type ThemePreference } from '@/lib/theme-mapper';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface ThemeSectionProps {
  initialTheme: ThemePreference;
  onSave: (theme: ThemePreference) => Promise<void>;
}

export default function ThemeSection({ initialTheme, onSave }: ThemeSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => { setTheme(initialTheme); }, [initialTheme]);

  const options: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: common('theme.light') },
    { value: 'dark', label: common('theme.dark') },
    { value: 'system', label: common('theme.system') },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave(theme);
      setFeedback({ type: 'success', text: t('preferences.themeUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title={t('preferences.themeTitle')} description={t('preferences.themeDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {options.map((option) => (
            <label key={option.value} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => setTheme(option.value)}
                disabled={isSaving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('preferences.saveTheme')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </SettingsCard>
  );
}
