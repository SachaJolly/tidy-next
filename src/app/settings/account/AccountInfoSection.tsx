import React from 'react';
import { useTranslations } from 'next-intl';

import Input from '@/components/Input/Input';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

interface AccountInfoSectionProps {
  status: string;
  role: string;
  createdAt: string;
  confirmedAt: string;
  emailConfirmed: boolean;
}

// Server component — read-only data, no interactivity needed.
export default function AccountInfoSection({ status, role, createdAt, confirmedAt, emailConfirmed }: AccountInfoSectionProps) {
  const t = useTranslations('settings');

  return (
    <SettingsCard title={t('account.infoTitle')} description={t('account.infoDescription')}>
      <Input id="settings-status" label={t('account.statusLabel')} defaultValue={status} disabled />
      <Input id="settings-role" label={t('account.roleLabel')} defaultValue={role} disabled />
      <Input id="settings-created-at" label={t('account.createdAtLabel')} defaultValue={createdAt} disabled />
      <Input id="settings-confirmed-at" label={t('account.confirmedAtLabel')} defaultValue={confirmedAt} disabled />
      <Input
        id="settings-email-confirmed"
        label={t('account.emailConfirmedLabel')}
        defaultValue={emailConfirmed ? t('account.yes') : t('account.no')}
        disabled
      />
    </SettingsCard>
  );
}
