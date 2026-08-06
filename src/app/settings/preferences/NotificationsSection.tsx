'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type UpdateNotificationsInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface NotificationsSectionProps {
  initialEmailNotifications: boolean;
  initialPushNotifications: boolean;
  onSave: (input: UpdateNotificationsInput) => Promise<void>;
}

export default function NotificationsSection({
  initialEmailNotifications,
  initialPushNotifications,
  onSave,
}: NotificationsSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [pushNotifications, setPushNotifications] = useState(initialPushNotifications);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setEmailNotifications(initialEmailNotifications);
    setPushNotifications(initialPushNotifications);
  }, [initialEmailNotifications, initialPushNotifications]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave({ emailNotifications, pushNotifications });
      setFeedback({ type: 'success', text: t('preferences.notificationsUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title={t('preferences.notificationsTitle')} description={t('preferences.notificationsDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              disabled={isSaving}
            />
            <span>{t('preferences.emailNotificationsLabel')}</span>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              disabled={isSaving}
            />
            <span>{t('preferences.pushNotificationsLabel')}</span>
          </label>
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('preferences.saveNotifications')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </SettingsCard>
  );
}
