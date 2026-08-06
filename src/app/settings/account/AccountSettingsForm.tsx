'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { updateAccountSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface AccountSettingsFormProps {
  initialValues: {
    email: string;
    status: string;
    role: string;
    createdAt: string;
    confirmedAt: string;
    emailConfirmed: boolean;
  };
}

export default function AccountSettingsForm({ initialValues }: AccountSettingsFormProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [email, setEmail] = useState(initialValues.email);
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  useEffect(() => {
    setEmail(initialValues.email);
  }, [initialValues.email]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updateAccountSettings({
        email,
        password: newPassword,
        passwordConfirmation,
      });

      setNewPassword('');
      setPasswordConfirmation('');
      setFeedback({ type: 'success', text: t('account.updated') });
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
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        id="settings-email"
        label={t('account.emailLabel')}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isSaving}
      />
      <Input
        id="settings-new-password"
        label={t('account.newPasswordLabel')}
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        disabled={isSaving}
      />
      <Input
        id="settings-password-confirmation"
        label={t('account.passwordConfirmationLabel')}
        type="password"
        value={passwordConfirmation}
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        disabled={isSaving}
      />
      <Input id="settings-status" label={t('account.statusLabel')} defaultValue={initialValues.status} disabled />
      <Input id="settings-role" label={t('account.roleLabel')} defaultValue={initialValues.role} disabled />
      <Input id="settings-created-at" label={t('account.createdAtLabel')} defaultValue={initialValues.createdAt} disabled />
      <Input id="settings-confirmed-at" label={t('account.confirmedAtLabel')} defaultValue={initialValues.confirmedAt} disabled />
      <Input
        id="settings-email-confirmed"
        label={t('account.emailConfirmedLabel')}
        defaultValue={initialValues.emailConfirmed ? t('account.yes') : t('account.no')}
        disabled
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.25rem' }}>
        <Button type="submit" variant="interactive" disabled={isSaving}>
          {t('account.updatePassword')}
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
