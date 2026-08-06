'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type UpdateProfileLinksInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface ProfileLinksSectionProps {
  initialValues: UpdateProfileLinksInput;
  onSave: (input: UpdateProfileLinksInput) => Promise<void>;
}

export default function ProfileLinksSection({ initialValues, onSave }: ProfileLinksSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [website, setWebsite] = useState(initialValues.website);
  const [twitter, setTwitter] = useState(initialValues.twitter);
  const [github, setGithub] = useState(initialValues.github);
  const [linkedin, setLinkedin] = useState(initialValues.linkedin);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setWebsite(initialValues.website);
    setTwitter(initialValues.twitter);
    setGithub(initialValues.github);
    setLinkedin(initialValues.linkedin);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave({ website, twitter, github, linkedin });
      setFeedback({ type: 'success', text: t('profile.linksUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t('profile.linksTitle')} description={t('profile.linksDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('profile.websiteLabel')} htmlFor="settings-website">
          <Input
            id="settings-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder={t('profile.websitePlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.twitterLabel')} htmlFor="settings-twitter">
          <Input
            id="settings-twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder={t('profile.twitterPlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.githubLabel')} htmlFor="settings-github">
          <Input
            id="settings-github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder={t('profile.githubPlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <FormField label={t('profile.linkedinLabel')} htmlFor="settings-linkedin">
          <Input
            id="settings-linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder={t('profile.linkedinPlaceholder')}
            disabled={isSaving}
          />
        </FormField>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('profile.saveLinks')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
