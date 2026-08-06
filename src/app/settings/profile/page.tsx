import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { api } from '@/lib/api';
import type { User } from '@/lib/types';

import {
  updatePublicProfileSettings,
  updateProfileLinksSettings,
  updateProfileVisibilitySettings,
} from '@/app/actions/me';
import PublicProfileSection from './PublicProfileSection';
import ProfileLinksSection from './ProfileLinksSection';
import ProfileVisibilitySection from './ProfileVisibilitySection';

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
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h2>{t('profile.title')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('profile.description')}</p>
      </div>
      <PublicProfileSection
        onSave={updatePublicProfileSettings}
        initialValues={{
          name: me?.name ?? '',
          bio: me?.bio ?? '',
          pronouns: me?.pronouns ?? '',
          avatar: me?.avatar ?? '',
          cover: me?.cover ?? '',
        }}
      />
      <ProfileLinksSection
        onSave={updateProfileLinksSettings}
        initialValues={{
          website: me?.website ?? '',
          twitter: me?.twitter ?? '',
          github: me?.github ?? '',
          linkedin: me?.linkedin ?? '',
        }}
      />
      <ProfileVisibilitySection
        onSave={updateProfileVisibilitySettings}
        initialProfilePrivate={me?.profilePrivate ?? false}
      />
    </>
  );
}
