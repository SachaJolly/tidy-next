'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { type UpdateProfileVisibilityInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import { Select } from '@/components/Select';

interface ProfileVisibilitySectionProps {
  initialProfilePrivate: boolean;
  onSave: (input: UpdateProfileVisibilityInput) => Promise<void>;
}

type VisibilityOption = 'public' | 'private';

export default function ProfileVisibilitySection({ initialProfilePrivate, onSave }: ProfileVisibilitySectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: profilePrivate, setValue: setProfilePrivate, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialProfilePrivate,
    onSave: async (value) => onSave({ profilePrivate: value }),
    successMessage: t('profile.visibilityUpdated'),
  });

  const visibilityValue: VisibilityOption = profilePrivate ? 'private' : 'public';

  return (
    <Card title={t('profile.visibilityTitle')} description={t('profile.visibilityDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('profile.visibilityLabel')}>
          <Select
            options={[
              { value: 'public', label: t('profile.visibilityPublic') },
              { value: 'private', label: t('profile.visibilityPrivate') },
            ]}
            value={visibilityValue}
            onChange={(value) => setProfilePrivate(value === 'private')}
            className="min-w-[220px]"
            hideDropdownIcon={false}
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
