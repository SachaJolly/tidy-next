'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

import { type UpdateAccountInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'danger'; text: string } | null;

interface EmailSectionProps {
  initialEmail: string;
  emailConfirmed: boolean;
  onSave: (input: UpdateAccountInput) => Promise<void>;
  onResendConfirmation: () => Promise<void>;
}

export default function EmailSection({
  initialEmail,
  emailConfirmed,
  onSave,
  onResendConfirmation,
}: EmailSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<Feedback | null>(null);

  const { value: email, setValue: setEmail, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialEmail,
    onSave: (newEmail) => onSave({ email: newEmail }),
    successMessage: t('account.emailUpdated'),
  });

  const handleResend = async () => {
    setIsResending(true);
    setResendFeedback(null);
    try {
      await onResendConfirmation();
      setResendFeedback({ type: 'success', text: t('account.resendConfirmationSent') });
    } catch {
      setResendFeedback({ type: 'danger', text: t('account.resendConfirmationFailed') });
    } finally {
      setIsResending(false);
    }
  };

  const finalFeedback = feedback || resendFeedback;

  const emailCaption = emailConfirmed ? (
    t('account.emailConfirmedCaption')
  ) : (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
      {t('account.emailNotConfirmedCaption')}
      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'var(--text-interactive)',
          cursor: isResending ? 'default' : 'pointer',
          fontSize: 'inherit',
          textDecoration: 'underline',
          opacity: isResending ? 0.6 : 1,
        }}
      >
        {isResending
          ? t('account.resendConfirmationSending')
          : t('account.resendConfirmationButton')}
      </button>
    </span>
  );

  return (
    <Card title={t('account.emailTitle')} description={t('account.emailDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('account.emailLabel')} caption={emailCaption} htmlFor="settings-email">
          <Input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving}
            variant={finalFeedback?.type}
            feedback={finalFeedback?.text}
          />
        </FormField>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
            {common('save')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
