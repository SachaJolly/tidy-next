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
import { Select } from '@/components/Select/Select';
import Textarea from '@/components/Textarea/Textarea';

const PRONOUNS_CUSTOM_VALUE = '__custom__';
const PREDEFINED_PRONOUNS = [
  { value: 'she/her', labelKey: 'profile.public.pronouns.options.sheHer' },
  { value: 'he/him', labelKey: 'profile.public.pronouns.options.heHim' },
  { value: 'they/them', labelKey: 'profile.public.pronouns.options.theyThem' },
] as const;

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
    successMessage: t('profile.public.updated'),
  });
  const initialPronouns = (initialValues.pronouns ?? '').trim();
  const isInitialPredefinedPronouns = PREDEFINED_PRONOUNS.some(({ value }) => value === initialPronouns);
  const [pronounsSelection, setPronounsSelection] = React.useState<string>(
    isInitialPredefinedPronouns ? initialPronouns : initialPronouns ? PRONOUNS_CUSTOM_VALUE : ''
  );
  const [customPronouns, setCustomPronouns] = React.useState<string>(
    isInitialPredefinedPronouns ? '' : initialPronouns
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePronounsSelectionChange = (value: string) => {
    setPronounsSelection(value);

    if (value === PRONOUNS_CUSTOM_VALUE) {
      setFormState((prev) => ({ ...prev, pronouns: customPronouns }));
      return;
    }

    setFormState((prev) => ({ ...prev, pronouns: value }));
  };

  const handleCustomPronounsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setCustomPronouns(nextValue);
    setFormState((prev) => ({ ...prev, pronouns: nextValue }));
  };

  const pronounsOptions = [
    { value: '', label: t('profile.public.pronouns.none') },
    ...PREDEFINED_PRONOUNS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })),
    { value: PRONOUNS_CUSTOM_VALUE, label: t('profile.public.pronouns.customOption') },
  ];

  return (
    <Card title={t('profile.public.title')} description={t('profile.public.description')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar
            src={formState.avatar || undefined}
            alt={formState.name || undefined}
            initials={formState.name ? formState.name[0] : '?'}
            size="96"
          />
          <div style={{ flex: 1 }}>
            <FormField label={t('profile.public.fields.avatar.label')} htmlFor="settings-avatar-url">
              <Input
                id="settings-avatar-url"
                name="avatar"
                value={formState.avatar || ''}
                onChange={handleChange}
                placeholder={t('profile.public.fields.avatar.placeholder')}
                disabled={isSaving}
              />
            </FormField>
          </div>
        </div>
        <div style={{ maxWidth: '20rem' }}>
          <FormField label={t('profile.public.fields.displayName.label')} htmlFor="settings-display-name">
              <Input
                id="settings-display-name"
                name="name"
                value={formState.name || ''}
                onChange={handleChange}
                placeholder={t('profile.public.fields.displayName.placeholder')}
                disabled={isSaving}
              />
          </FormField>
        </div>
        <div style={{ maxWidth: '20rem' }}>
          <FormField
            label={t('profile.public.pronouns.label')}
            htmlFor="settings-pronouns-select"
            caption={t('profile.public.pronouns.caption')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Select
                id="settings-pronouns-select"
                value={pronounsSelection}
                onChange={handlePronounsSelectionChange}
                options={pronounsOptions}
                placeholder={t('profile.public.pronouns.placeholder')}
              />
              {pronounsSelection === PRONOUNS_CUSTOM_VALUE && (
                <Input
                  id="settings-pronouns-custom"
                  name="pronounsCustom"
                  value={customPronouns}
                  onChange={handleCustomPronounsChange}
                  placeholder={t('profile.public.pronouns.customPlaceholder')}
                  disabled={isSaving}
                  maxLength={60}
                />
              )}
            </div>
          </FormField>
        </div>
        <FormField label={t('profile.public.fields.bio.label')} htmlFor="settings-bio">
          <Textarea
            id="settings-bio"
            name="bio"
            value={formState.bio || ''}
            onChange={handleChange}
            placeholder={t('profile.public.fields.bio.placeholder')}
            disabled={isSaving}
            rows={4}
          />
        </FormField>
        <FormField label={t('profile.public.fields.cover.label')} htmlFor="settings-cover">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            <Input
              id="settings-cover"
              name="cover"
              value={formState.cover || ''}
              onChange={handleChange}
              placeholder={t('profile.public.fields.cover.placeholder')}
              disabled={isSaving}
            />
            {formState.cover && (
              <img
                src={formState.cover}
                alt="cover preview"
                style={{ width: '100%', borderRadius: '0.5rem' }}
              />
            )}
          </div>
        </FormField>
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
