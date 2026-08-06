'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';

interface UsernameSectionProps {
  initialUsername: string;
  onSave: (username: string) => Promise<void>;
}

export default function UsernameSection({ initialUsername, onSave }: UsernameSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: username, setValue: setUsername, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialUsername,
    onSave,
    successMessage: t('account.usernameUpdated'),
  });

  return (
    <Card title={t('account.usernameTitle')} description={t('account.usernameDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('account.usernameLabel')} htmlFor="settings-username">
          <Input
            id="settings-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('profile.fields.username.placeholder')}
            disabled={isSaving}
            prefix="@"
            variant={feedback?.type}
            feedback={feedback?.text}
          />
        </FormField>
        <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
          {common('save')}
        </Button>
      </form>
    </Card>
  );
}
