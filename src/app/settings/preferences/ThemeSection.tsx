'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import { type ThemePreference, THEME_OPTIONS } from '@/lib/theme-mapper';
import Card from '@/components/Card/Card';

interface ThemeSectionProps {
  initialTheme: ThemePreference;
  onSave: (theme: ThemePreference) => Promise<void>;
}

export default function ThemeSection({ initialTheme, onSave }: ThemeSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: theme, setValue: setTheme, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialTheme,
    onSave,
    successMessage: t('preferences.themeUpdated'),
  });

  return (
    <Card title={t('preferences.themeTitle')} description={t('preferences.themeDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {THEME_OPTIONS.map((option) => (
            <label key={option} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="theme"
                value={option}
                checked={theme === option}
                onChange={() => setTheme(option)}
                disabled={isSaving}
              />
              <span>{common(`theme.${option}`)}</span>
            </label>
          ))}
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
            {common('save')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--text-danger)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
