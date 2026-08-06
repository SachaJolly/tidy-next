'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { type UpdatePublicProfileInput } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Card from '@/components/Card/Card';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface PublicProfileSectionProps {
  initialValues: UpdatePublicProfileInput;
  onSave: (input: UpdatePublicProfileInput) => Promise<void>;
}

export default function PublicProfileSection({ initialValues, onSave }: PublicProfileSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [bio, setBio] = useState(initialValues.bio);
  const [avatar, setAvatar] = useState(initialValues.avatar);
  const [cover, setCover] = useState(initialValues.cover);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setName(initialValues.name);
    setBio(initialValues.bio);
    setAvatar(initialValues.avatar);
    setCover(initialValues.cover);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave({ name, bio, avatar, cover });
      setFeedback({ type: 'success', text: t('profile.updated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t('profile.publicTitle')} description={t('profile.publicDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          id="settings-avatar-url"
          label={t('profile.avatarLabel')}
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder={t('profile.avatarPlaceholder')}
          disabled={isSaving}
        />
        <Input
          id="settings-display-name"
          label={t('profile.displayNameLabel')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.displayNamePlaceholder')}
          disabled={isSaving}
        />
        <Input
          id="settings-bio"
          label={t('profile.bioLabel')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t('profile.bioPlaceholder')}
          disabled={isSaving}
        />
        <Input
          id="settings-cover"
          label={t('profile.coverLabel')}
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder={t('profile.coverPlaceholder')}
          disabled={isSaving}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('profile.save')}
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
