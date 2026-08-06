'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { updateUsernameSettings } from '@/app/actions/me';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

type Feedback = { type: 'success' | 'error'; text: string } | null;

export default function UsernameSection({ initialUsername }: { initialUsername: string }) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => { setUsername(initialUsername); }, [initialUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateUsernameSettings(username);
      setFeedback({ type: 'success', text: t('account.usernameUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title={t('account.usernameTitle')} description={t('account.usernameDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          id="settings-username"
          label={t('account.usernameLabel')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('profile.usernamePlaceholder')}
          disabled={isSaving}
        />
        <div>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('account.saveUsername')}
          </Button>
        </div>
        {feedback && (
          <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
            {feedback.text}
          </p>
        )}
      </form>
    </SettingsCard>
  );
}
