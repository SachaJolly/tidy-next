'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { type UpdateProfileVisibilityInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import ChoiceInput from '@/components/ChoiceInput/ChoiceInput';

interface ProfileVisibilitySectionProps {
  initialProfilePrivate: boolean;
  onSave: (input: UpdateProfileVisibilityInput) => Promise<void>;
}

export default function ProfileVisibilitySection({ initialProfilePrivate, onSave }: ProfileVisibilitySectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: profilePrivate, setValue: setProfilePrivate, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialProfilePrivate,
    onSave: async (value) => onSave({ profilePrivate: value }),
    successMessage: t('profile.visibilityUpdated'),
  });

  return (
    <Card title={t('profile.visibilityTitle')} description={t('profile.visibilityDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <ChoiceInput
            id="settings-profile-private"
            type="checkbox"
            name="profilePrivate"
            checked={profilePrivate}
            onChange={(e) => setProfilePrivate(e.target.checked)}
            disabled={isSaving}
            label={t('profile.visibilityPrivate')}
            caption={t('profile.visibilityPrivateCaption')}
          />
        </fieldset>
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
