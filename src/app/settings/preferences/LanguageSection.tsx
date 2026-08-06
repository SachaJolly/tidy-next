'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import { type LanguagePreference } from '@/lib/language-mapper';
import Card from '@/components/Card/Card';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface LanguageSectionProps {
  initialLanguage: LanguagePreference;
  onSave: (language: LanguagePreference) => Promise<void>;
}

export default function LanguageSection({ initialLanguage, onSave }: LanguageSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const router = useRouter();
  const [language, setLanguage] = useState<LanguagePreference>(initialLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => { setLanguage(initialLanguage); }, [initialLanguage]);

  const options: { value: LanguagePreference; label: string }[] = [
    { value: 'en', label: common('language.en') },
    { value: 'fr', label: common('language.fr') },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave(language);
      setFeedback({ type: 'success', text: t('preferences.languageUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t('preferences.languageTitle')} description={t('preferences.languageDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {options.map((option) => (
            <label key={option.value} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name="language"
                value={option.value}
                checked={language === option.value}
                onChange={() => setLanguage(option.value)}
                disabled={isSaving}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('preferences.saveLanguage')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
