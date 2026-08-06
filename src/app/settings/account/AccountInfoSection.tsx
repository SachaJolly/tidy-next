import React from 'react';
import { useTranslations } from 'next-intl';

import Input from '@/components/Input/Input';
import Card from '@/components/Card/Card';
import FormField from '@/components/FormField/FormField';

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
    <Card title={t('account.infoTitle')} description={t('account.infoDescription')}>
      <FormField label={t('account.statusLabel')} htmlFor="settings-status">
        <Input id="settings-status" defaultValue={status} disabled />
      </FormField>
      <FormField label={t('account.roleLabel')} htmlFor="settings-role">
        <Input id="settings-role" defaultValue={role} disabled />
      </FormField>
      <FormField label={t('account.createdAtLabel')} htmlFor="settings-created-at">
        <Input id="settings-created-at" defaultValue={createdAt} disabled />
      </FormField>
      <FormField label={t('account.confirmedAtLabel')} htmlFor="settings-confirmed-at">
        <Input id="settings-confirmed-at" defaultValue={confirmedAt} disabled />
      </FormField>
      <FormField label={t('account.emailConfirmedLabel')} htmlFor="settings-email-confirmed">
        <Input id="settings-email-confirmed" defaultValue={emailConfirmed ? t('account.yes') : t('account.no')} disabled />
      </FormField>
    </Card>
  );
}
