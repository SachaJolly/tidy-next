'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { type UpdatePublicProfileInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Avatar from '@/components/Avatar/Avatar';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';
import Textarea from '@/components/Textarea/Textarea';

interface PublicProfileSectionProps {
  initialValues: UpdatePublicProfileInput;
  onSave: (input: UpdatePublicProfileInput) => Promise<void>;
}

export default function PublicProfileSection({ initialValues, onSave }: PublicProfileSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const {
    value: formState,
    setValue: setFormState,
    isSaving,
    feedback,
    handleSubmit,
    isDirty,
  } = useSettingsForm({
    initialValue: initialValues,
    onSave,
    successMessage: t('profile.updated'),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Card title={t('profile.publicTitle')} description={t('profile.publicDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar
            src={formState.avatar || undefined}
            alt={formState.name || undefined}
            initials={formState.name ? formState.name[0] : '?'}
            size="96"
          />
          <div style={{ flex: 1 }}>
            <FormField label={t('profile.avatarLabel')} htmlFor="settings-avatar-url">
              <Input
                id="settings-avatar-url"
                name="avatar"
                value={formState.avatar || ''}
                onChange={handleChange}
                placeholder={t('profile.avatarPlaceholder')}
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>
        <FormField label={t('profile.displayNameLabel')} htmlFor="settings-display-name">
          <Input
            id="settings-display-name"
            name="name"
            value={formState.name || ''}
            onChange={handleChange}
            placeholder={t('profile.displayNamePlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.bioLabel')} htmlFor="settings-bio">
          <Textarea
            id="settings-bio"
            name="bio"
            value={formState.bio || ''}
            onChange={handleChange}
            placeholder={t('profile.bioPlaceholder')}
            disabled={isSaving}
            rows={4}
          />
        </FormField>
        <FormField label={t('profile.coverLabel')} htmlFor="settings-cover">
          <Input
            id="settings-cover"
            name="cover"
            value={formState.cover || ''}
            onChange={handleChange}
            placeholder={t('profile.coverPlaceholder')}
            disabled={isSaving}
          />
          {formState.cover && (
            <img
              src={formState.cover}
              alt="cover preview"
              style={{ width: '100%', borderRadius: '0.5rem', maxHeight: '160px', objectFit: 'cover' }}
            />
          )}
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
