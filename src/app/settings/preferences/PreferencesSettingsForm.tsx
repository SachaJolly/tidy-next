'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { updatePreferencesSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import { type LanguagePreference } from '@/lib/language-mapper';
import { type ThemePreference } from '@/lib/theme-mapper';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface PreferencesSettingsFormProps {
  initialLanguage: LanguagePreference;
  initialTheme: ThemePreference;
  initialEmailNotifications: boolean;
  initialPushNotifications: boolean;
}

export default function PreferencesSettingsForm({
  initialLanguage,
  initialTheme,
  initialEmailNotifications,
  initialPushNotifications,
}: PreferencesSettingsFormProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const router = useRouter();
  const [language, setLanguage] = useState<LanguagePreference>(initialLanguage);
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [pushNotifications, setPushNotifications] = useState(initialPushNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setLanguage(initialLanguage);
    setTheme(initialTheme);
    setEmailNotifications(initialEmailNotifications);
    setPushNotifications(initialPushNotifications);
  }, [initialLanguage, initialTheme, initialEmailNotifications, initialPushNotifications]);

  const languageOptions = useMemo(
    () => [
      { value: 'en' as const, label: common('language.en') },
      { value: 'fr' as const, label: common('language.fr') },
    ],
    [common],
  );

  const themeOptions = useMemo(
    () => [
      { value: 'light' as const, label: common('theme.light') },
      { value: 'dark' as const, label: common('theme.dark') },
      { value: 'system' as const, label: common('theme.system') },
    ],
    [common],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updatePreferencesSettings({
        language,
        theme,
        emailNotifications,
        pushNotifications,
      });

      setFeedback({ type: 'success', text: t('preferences.updated') });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : t('saveFailed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h3 style={{ margin: 0 }}>{t('preferences.themeTitle')}</h3>
        <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>{t('preferences.themeDescription')}</p>
        <fieldset
          style={{
            border: 0,
            margin: '1rem 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {themeOptions.map((option) => (
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
      </section>

      <section>
        <h3 style={{ margin: 0 }}>{t('preferences.languageTitle')}</h3>
        <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>{t('preferences.languageDescription')}</p>
        <fieldset
          style={{
            border: 0,
            margin: '1rem 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {languageOptions.map((option) => (
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
      </section>

      <section>
        <h3 style={{ margin: 0 }}>{t('preferences.notificationsTitle')}</h3>
        <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>{t('preferences.notificationsDescription')}</p>
        <fieldset
          style={{
            border: 0,
            margin: '1rem 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
              disabled={isSaving}
            />
            <span>{t('preferences.emailNotificationsLabel')}</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(event) => setPushNotifications(event.target.checked)}
              disabled={isSaving}
            />
            <span>{t('preferences.pushNotificationsLabel')}</span>
          </label>
        </fieldset>
      </section>

      <div>
        <Button type="submit" variant="interactive" disabled={isSaving}>
          {t('preferences.save')}
        </Button>
      </div>

      {feedback && (
        <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
          {feedback.text}
        </p>
      )}
    </form>
  );
}
