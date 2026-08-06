'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { type UpdateNotificationsInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import ChoiceInput from '@/components/ChoiceInput/ChoiceInput';

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
  const common = useTranslations('common');

  // Memoize the initial value to prevent re-creating the object on every render,
  // which would cause an infinite loop in the useSettingsForm hook.
  const initialValue = React.useMemo(
    () => ({
      emailNotifications: initialEmailNotifications,
      pushNotifications: initialPushNotifications,
    }),
    [initialEmailNotifications, initialPushNotifications]
  );

  const {
    value: formState,
    setValue: setFormState,
    isSaving,
    feedback,
    handleSubmit,
    isDirty,
  } = useSettingsForm({
    initialValue,
    onSave,
    successMessage: t('preferences.notificationsUpdated'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  return (
    <Card title={t('preferences.notificationsTitle')} description={t('preferences.notificationsDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ChoiceInput
            id="settings-email-notifications"
            type="checkbox"
            name="emailNotifications"
            label={t('preferences.emailNotificationsLabel')}
            checked={formState.emailNotifications}
            onChange={handleChange}
            disabled={isSaving}
          />
          <ChoiceInput
            id="settings-push-notifications"
            type="checkbox"
            name="pushNotifications"
            label={t('preferences.pushNotificationsLabel')}
            checked={formState.pushNotifications}
            onChange={handleChange}
            disabled={isSaving}
          />
        </fieldset>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
            {common('save')}
          </Button>
          {feedback && (
            <p className="text-small" style={{ color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--text-danger)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
