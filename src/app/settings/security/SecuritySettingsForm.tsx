'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { updatePasswordSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

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
      <SettingsCard title={t('security.passwordTitle')} description={t('security.passwordDescription')}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div>
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
      </SettingsCard>

      {/* Placeholder — will hold OAuth providers, passkeys, 2FA toggles */}
      <SettingsCard title={t('security.authMethodsTitle')} description={t('security.authMethodsDescription')}>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('moreComingSoon')}</p>
      </SettingsCard>
    </>
  );
}
