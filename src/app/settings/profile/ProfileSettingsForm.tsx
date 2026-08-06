'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { updateProfileSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface ProfileSettingsFormProps {
  initialValues: {
    name: string;
    username: string;
    bio: string;
    avatar: string;
    cover: string;
    website: string;
    twitter: string;
    github: string;
    linkedin: string;
  };
}

export default function ProfileSettingsForm({ initialValues }: ProfileSettingsFormProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [name, setName] = useState(initialValues.name);
  const [username, setUsername] = useState(initialValues.username);
  const [bio, setBio] = useState(initialValues.bio);
  const [avatar, setAvatar] = useState(initialValues.avatar);
  const [cover, setCover] = useState(initialValues.cover);
  const [website, setWebsite] = useState(initialValues.website);
  const [twitter, setTwitter] = useState(initialValues.twitter);
  const [github, setGithub] = useState(initialValues.github);
  const [linkedin, setLinkedin] = useState(initialValues.linkedin);

  useEffect(() => {
    setName(initialValues.name);
    setUsername(initialValues.username);
    setBio(initialValues.bio);
    setAvatar(initialValues.avatar);
    setCover(initialValues.cover);
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
      await updateProfileSettings({
        name,
        username,
        bio,
        avatar,
        cover,
        website,
        twitter,
        github,
        linkedin,
      });

      setFeedback({ type: 'success', text: t('profile.updated') });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : t('saveFailed'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Input
        id="settings-avatar-url"
        label={t('profile.avatarLabel')}
        value={avatar}
        onChange={(event) => setAvatar(event.target.value)}
        placeholder={t('profile.avatarPlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-display-name"
        label={t('profile.displayNameLabel')}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t('profile.displayNamePlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-bio"
        label={t('profile.bioLabel')}
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        placeholder={t('profile.bioPlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-username"
        label={t('profile.usernameLabel')}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder={t('profile.usernamePlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-cover"
        label={t('profile.coverLabel')}
        value={cover}
        onChange={(event) => setCover(event.target.value)}
        placeholder={t('profile.coverPlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-website"
        label={t('profile.websiteLabel')}
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        placeholder={t('profile.websitePlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-twitter"
        label={t('profile.twitterLabel')}
        value={twitter}
        onChange={(event) => setTwitter(event.target.value)}
        placeholder={t('profile.twitterPlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-github"
        label={t('profile.githubLabel')}
        value={github}
        onChange={(event) => setGithub(event.target.value)}
        placeholder={t('profile.githubPlaceholder')}
        disabled={isSaving}
      />
      <Input
        id="settings-linkedin"
        label={t('profile.linkedinLabel')}
        value={linkedin}
        onChange={(event) => setLinkedin(event.target.value)}
        placeholder={t('profile.linkedinPlaceholder')}
        disabled={isSaving}
      />

      <div style={{ marginTop: '0.25rem' }}>
        <Button type="submit" variant="interactive" disabled={isSaving}>
          {t('profile.save')}
        </Button>
      </div>

      {feedback && (
        <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
          {feedback.text}
        </p>
      )}
    </form>
  );
}
