'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import { type LanguagePreference, LANGUAGE_OPTIONS } from '@/lib/language-mapper';
import Card from '@/components/Card/Card';

interface LanguageSectionProps {
  initialLanguage: LanguagePreference;
  onSave: (language: LanguagePreference) => Promise<void>;
}

export default function LanguageSection({ initialLanguage, onSave }: LanguageSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: language, setValue: setLanguage, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialLanguage,
    onSave,
    successMessage: t('preferences.languageUpdated'),
  });

  return (
    <Card title={t('preferences.languageTitle')} description={t('preferences.languageDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {LANGUAGE_OPTIONS.map((option) => (
            <label key={option} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="language"
                value={option}
                checked={language === option}
                onChange={() => setLanguage(option)}
                disabled={isSaving}
              />
              <span>{common(`language.${option}`)}</span>
            </label>
          ))}
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
            {common('save')}
          </Button>
          {feedback && (
            <p className="text-small" style={{ color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--text-danger)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
