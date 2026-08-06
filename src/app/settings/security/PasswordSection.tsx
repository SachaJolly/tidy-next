'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { type UpdatePasswordInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'danger'; text: string } | null;

const INITIAL_STATE = {
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: '',
};

interface PasswordSectionProps {
  onSave: (input: UpdatePasswordInput) => Promise<void>;
}

export default function PasswordSection({ onSave }: PasswordSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave(formState);
      setFormState(INITIAL_STATE);
      setFeedback({ type: 'success', text: t('security.passwordUpdated') });
    } catch (error) {
      setFeedback({
        type: 'danger',
        text: error instanceof Error ? error.message : t('saveFailed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // The form is "dirty" if all fields have some value.
  const isDirty =
    formState.currentPassword.length > 0 &&
    formState.newPassword.length > 0 &&
    formState.passwordConfirmation.length > 0;

  return (
    <Card title={t('security.passwordTitle')} description={t('security.passwordDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('security.currentPasswordLabel')} htmlFor="security-current-password">
          <Input
            id="security-current-password"
            name="currentPassword"
            type="password"
            value={formState.currentPassword}
            onChange={handleChange}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('security.newPasswordLabel')} htmlFor="security-new-password">
          <Input
            id="security-new-password"
            name="newPassword"
            type="password"
            value={formState.newPassword}
            onChange={handleChange}
            disabled={isSaving}
          />
        </FormField>
        <FormField
          label={t('security.passwordConfirmationLabel')}
          htmlFor="security-password-confirmation"
        >
          <Input
            id="security-password-confirmation"
            name="passwordConfirmation"
            type="password"
            value={formState.passwordConfirmation}
            onChange={handleChange}
            disabled={isSaving}
          />
        </FormField>
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
