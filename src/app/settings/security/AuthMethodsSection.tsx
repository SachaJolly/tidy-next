import React from 'react';
import { getTranslations } from 'next-intl/server';

import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

export default async function AuthMethodsSection() {
  const t = await getTranslations('settings');

  return (
    // Placeholder — will hold OAuth providers, passkeys, 2FA toggles
    <SettingsCard title={t('security.authMethodsTitle')} description={t('security.authMethodsDescription')}>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('moreComingSoon')}</p>
    </SettingsCard>
  );
}
