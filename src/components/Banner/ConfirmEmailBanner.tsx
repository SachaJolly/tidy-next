'use client';

import React, { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import Banner from './Banner';

interface ConfirmEmailBannerProps {
  onResend: () => Promise<void>;
}

export default function ConfirmEmailBanner({ onResend }: ConfirmEmailBannerProps) {
  const t = useTranslations('common');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const handleResend = () => {
    setFeedback(null);
    setFeedbackType(null);

    startTransition(async () => {
      try {
        await onResend();
        setFeedback(t('confirmEmailResendSent'));
        setFeedbackType('success');
      } catch {
        setFeedback(t('confirmEmailResendFailed'));
        setFeedbackType('error');
      }
    });
  };

  return (
    <Banner title={t('confirmEmailTitle')}>
      <p style={{ margin: 0 }}>
        {t('confirmEmailDescription')}{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            color: 'var(--text-interactive)',
            textDecoration: 'underline',
            cursor: isPending ? 'default' : 'pointer',
          }}
        >
          {isPending ? t('confirmEmailResendSending') : t('confirmEmailResendLink')}
        </button>
      </p>
      {feedback && (
        <p style={{ margin: '0.5rem 0 0', color: feedbackType === 'error' ? 'var(--text-danger)' : 'var(--text-interactive)' }}>
          {feedback}
        </p>
      )}
    </Banner>
  );
}
