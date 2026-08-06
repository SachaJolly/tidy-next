'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';
import Input from '@/components/Input/Input';
import InputGroup from '@/components/InputGroup/InputGroup';

type Feedback = { type: 'success' | 'error'; text: string } | null;

interface UsernameSectionProps {
  initialUsername: string;
  onSave: (username: string) => Promise<void>;
}

export default function UsernameSection({ initialUsername, onSave }: UsernameSectionProps) {
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
      await onSave(username);
      setFeedback({ type: 'success', text: t('account.usernameUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title={t('account.usernameTitle')} description={t('account.usernameDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label={t('account.usernameLabel')} htmlFor="settings-username">
          <InputGroup>
            <Input
              id="settings-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('profile.usernamePlaceholder')}
              disabled={isSaving}
            />
            <Button type="submit" variant="interactive" disabled={isSaving}>
              {t('account.saveUsername')}
            </Button>
          </InputGroup>
        </FormField>
        {feedback && (
          <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
            {feedback.text}
          </p>
        )}
      </form>
    </Card>
  );
}
