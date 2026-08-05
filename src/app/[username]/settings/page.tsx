'use client';

import React, { useState, useCallback, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Button from '@/components/Button/Button';
import { type Language } from '@/lib/language-mapper';
import { changeLanguage } from '@/app/actions/language';

interface SettingsPageProps {
  // Next.js now passes `params` as a Promise, even to Client Component pages.
  // It must be unwrapped with React's `use()` hook instead of accessed synchronously.
  params: Promise<{ username: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { username } = use(params);
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale as Language);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // BUG D FIX: keep local state in sync with next-intl's active locale.
  // If the language is reconciled elsewhere (e.g. middleware syncing DB -> cookie
  // after a change made on another device, followed by a route refresh), `locale`
  // will update but this component's local `useState` wouldn't pick it up on its
  // own since it only reads its initial value once on mount.
  useEffect(() => {
    setCurrentLanguage(locale as Language);
  }, [locale]);

  const languageOptions = [
    { value: 'en' as const, label: common('language.en') },
    { value: 'fr' as const, label: common('language.fr') },
  ] as const;

  // Handle language change - sync to both cookie and DB
  const handleLanguageChange = useCallback(
    async (newLanguage: Language) => {
      if (newLanguage === currentLanguage) return;

      setIsSaving(true);
      setMessage(null);

      try {
        // DB first, cookie only synced on success — see changeLanguage() for the
        // full DB-source-of-truth hierarchy logic (guests fall back to cookie-only).
        await changeLanguage(newLanguage);

        setCurrentLanguage(newLanguage);
        setMessage({ type: 'success', text: t('languageUpdated') });

        // Refresh to reload messages with new language
        setTimeout(() => {
          router.refresh();
        }, 500);
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : t('saveFailed'),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [currentLanguage, router, t],
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>{t('title', { username })}</h1>

      {/* Language Preference Section */}
      <section style={{ marginTop: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <h2>{t('languageSectionTitle')}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          {t('languageDescription')}
        </p>

        <fieldset style={{ display: 'flex', gap: '1rem', flexDirection: 'column', border: 'none', padding: 0 }}>
          {languageOptions.map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px',
                backgroundColor: currentLanguage === value ? 'var(--background-hover)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="language"
                value={value}
                checked={currentLanguage === value}
                onChange={() => handleLanguageChange(value)}
                disabled={isSaving}
                style={{ cursor: 'pointer' }}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        {message && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '4px',
              backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            {message.text}
          </div>
        )}
      </section>

      {/* Additional Settings Sections Can Be Added Here */}
      <div style={{ marginTop: '2rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
        <p>{t('moreComingSoon')}</p>
      </div>
    </div>
  );
}
