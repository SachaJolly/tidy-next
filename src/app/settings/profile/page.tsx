import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { api } from '@/lib/api';
import type { User } from '@/lib/types';

import ProfileSettingsForm from './ProfileSettingsForm';

export default async function ProfileSettingsPage() {
  const t = await getTranslations('settings');
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;
  let me: User | null = null;

  try {
    if (authToken) {
      me = await api.auth.get<User>('/api/v1/me', {
        authorization: authToken,
        cache: 'no-store',
      });
    }
  } catch {
    me = null;
  }

  return (
    <section style={{ maxWidth: '720px' }}>
      <h2 style={{ margin: 0 }}>{t('profile.title')}</h2>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{t('profile.description')}</p>
      <ProfileSettingsForm
        initialValues={{
          name: me?.name ?? '',
          bio: me?.bio ?? '',
          avatar: me?.avatar ?? '',
          cover: me?.cover ?? '',
          website: me?.website ?? '',
          twitter: me?.twitter ?? '',
          github: me?.github ?? '',
          linkedin: me?.linkedin ?? '',
        }}
      />
    </section>
  );
}
