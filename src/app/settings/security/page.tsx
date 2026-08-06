import React from 'react';
import { getTranslations } from 'next-intl/server';

import { updatePasswordSettings } from '@/app/actions/me';
import AuthMethodsSection from './AuthMethodsSection';
import PasswordSection from './PasswordSection';

export default async function SecuritySettingsPage() {
  const t = await getTranslations('settings');

  return (
    <section style={{ maxWidth: '720px' }}>
      <h2 style={{ margin: 0 }}>{t('security.title')}</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{t('security.description')}</p>
      <PasswordSection onSave={updatePasswordSettings} />
      <AuthMethodsSection />
    </section>
  );
}

