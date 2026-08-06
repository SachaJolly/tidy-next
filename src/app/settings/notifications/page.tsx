import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { api } from '@/lib/api';
import { updateNotificationsSettings } from '@/app/actions/me';
import type { User } from '@/lib/types';

import NotificationsSection from './NotificationsSection';

export default async function NotificationsSettingsPage() {
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
      <h2 style={{ margin: 0 }}>{t('notifications.title')}</h2>
      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('notifications.description')}</p>
      <NotificationsSection
        initialEmailNotifications={me?.emailNotifications ?? true}
        initialPushNotifications={me?.pushNotifications ?? true}
        onSave={updateNotificationsSettings}
      />
    </section>
  );
}
