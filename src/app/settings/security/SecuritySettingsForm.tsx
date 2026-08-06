'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { updatePasswordSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'error'; text: string } | null;

export default function SecuritySettingsForm() {
  const t = useTranslations('settings');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updatePasswordSettings({ currentPassword, newPassword, passwordConfirmation });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      setFeedback({ type: 'success', text: t('security.passwordUpdated') });
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
    <>
      {/* Password section */}
      <section style={{ marginTop: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>{t('security.passwordTitle')}</h3>
        <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>{t('security.passwordDescription')}</p>
        <form
          onSubmit={handleSubmit}
          style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <Input
            id="security-current-password"
            label={t('security.currentPasswordLabel')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSaving}
          />
          <Input
            id="security-new-password"
            label={t('security.newPasswordLabel')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSaving}
          />
          <Input
            id="security-password-confirmation"
            label={t('security.passwordConfirmationLabel')}
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isSaving}
          />

          <div style={{ marginTop: '0.25rem' }}>
            <Button type="submit" variant="interactive" disabled={isSaving}>
              {t('security.updatePassword')}
            </Button>
          </div>

          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </form>
      </section>

      {/* Placeholder for future auth methods (OAuth, passkeys, 2FA…) */}
      <section style={{ marginTop: '2.5rem' }}>
        <h3 style={{ margin: 0 }}>{t('security.authMethodsTitle')}</h3>
        <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>{t('security.authMethodsDescription')}</p>
      </section>
    </>
  );
}
