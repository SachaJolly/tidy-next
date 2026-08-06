import React from 'react';
import { getTranslations } from 'next-intl/server';

import { updatePasswordSettings } from '@/app/actions/me';
import AuthMethodsSection from './AuthMethodsSection';
import PasswordSection from './PasswordSection';

export default async function SecuritySettingsPage() {
  const t = await getTranslations('settings');

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h2>{t('security.title')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('security.description')}</p>
      </div>
      <PasswordSection onSave={updatePasswordSettings} />
      <AuthMethodsSection />
    </>
  );
}

