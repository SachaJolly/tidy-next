'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { type UpdateProfileLinksInput } from '@/app/actions/me';
import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';

interface ProfileLinksSectionProps {
  initialValues: UpdateProfileLinksInput;
  onSave: (input: UpdateProfileLinksInput) => Promise<void>;
}

export default function ProfileLinksSection({ initialValues, onSave }: ProfileLinksSectionProps) {
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
    successMessage: t('profile.linksUpdated'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Card title={t('profile.linksTitle')} description={t('profile.linksDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('profile.websiteLabel')} htmlFor="settings-website">
          <Input
            id="settings-website"
            name="website"
            value={formState.website || ''}
            onChange={handleChange}
            placeholder={t('profile.websitePlaceholder')}
            disabled={isSaving}
            prefix={<Icon name="link" size={20} />}
          />
        </FormField>
        <FormField label={t('profile.twitterLabel')} htmlFor="settings-twitter">
          <Input
            id="settings-twitter"
            name="twitter"
            value={formState.twitter || ''}
            onChange={handleChange}
            placeholder={t('profile.twitterPlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.githubLabel')} htmlFor="settings-github">
          <Input
            id="settings-github"
            name="github"
            value={formState.github || ''}
            onChange={handleChange}
            placeholder={t('profile.githubPlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.linkedinLabel')} htmlFor="settings-linkedin">
          <Input
            id="settings-linkedin"
            name="linkedin"
            value={formState.linkedin || ''}
            onChange={handleChange}
            placeholder={t('profile.linkedinPlaceholder')}
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
