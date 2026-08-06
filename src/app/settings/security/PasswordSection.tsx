'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { type UpdatePasswordInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Card from '@/components/Card/Card';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface PasswordSectionProps {
  onSave: (input: UpdatePasswordInput) => Promise<void>;
}

export default function PasswordSection({ onSave }: PasswordSectionProps) {
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
      await onSave({ currentPassword, newPassword, passwordConfirmation });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      setFeedback({ type: 'success', text: t('security.passwordUpdated') });
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t('security.passwordTitle')} description={t('security.passwordDescription')}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('security.updatePassword')}
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
