'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type UpdateAccountInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';
import InputGroup from '@/components/InputGroup/InputGroup';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface EmailSectionProps {
  initialEmail: string;
  emailConfirmed: boolean;
  onSave: (input: UpdateAccountInput) => Promise<void>;
  onResendConfirmation: () => Promise<void>;
}

export default function EmailSection({ initialEmail, emailConfirmed, onSave, onResendConfirmation }: EmailSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => { setEmail(initialEmail); }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSave({ email });
      setFeedback({ type: 'success', text: t('account.emailUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setFeedback(null);
    try {
      await onResendConfirmation();
      setFeedback({ type: 'success', text: t('account.resendConfirmationSent') });
    } catch {
      setFeedback({ type: 'error', text: t('account.resendConfirmationFailed') });
    } finally {
      setIsResending(false);
    }
  };

  // Build the caption shown under the email label.
  const emailCaption = emailConfirmed
    ? t('account.emailConfirmedCaption')
    : (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {t('account.emailNotConfirmedCaption')}
        <Button
          type="button"
          variant="interactive"
          size="small"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? t('account.resendConfirmationSending') : t('account.resendConfirmationButton')}
        </Button>
      </span>
    );

  return (
    <Card title={t('account.emailTitle')} description={t('account.emailDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('account.emailLabel')} caption={emailCaption} htmlFor="settings-email">
          <InputGroup>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
            />
            <Button type="submit" variant="interactive" disabled={isSaving}>
              {common('save')}
            </Button>
          </InputGroup>
        </FormField>
        {feedback && (
          <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
            {feedback.text}
          </p>
        )}
      </form>
    </Card>
  );
}
