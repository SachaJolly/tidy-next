import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { api } from '@/lib/api';
import type { User } from '@/lib/types';

import AccountSettingsForm from './AccountSettingsForm';

export default async function AccountSettingsPage() {
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
      <h2 style={{ margin: 0 }}>{t('account.title')}</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('account.description')}</p>
      <AccountSettingsForm
        initialValues={{
          email: me?.email ?? '',
          status: me?.status ?? '',
          role: me?.role ?? '',
          createdAt: me?.createdAt ?? '',
          confirmedAt: me?.confirmedAt ?? '',
          emailConfirmed: me?.emailConfirmed ?? false,
        }}
      />
    </section>
  );
}
