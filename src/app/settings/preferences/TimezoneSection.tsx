'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { useSettingsForm } from '@/hooks/useSettingsForm';
import Button from '@/components/Button/Button';
import { TIMEZONE_AUTO } from '@/lib/timezone-mapper';
import Card from '@/components/Card/Card';
import { Select } from '@/components/Select';
import Icon from '@/components/Icon/Icon';

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Africa/Johannesburg',
  'Africa/Cairo',
];

function buildTimezoneOptions(): { value: string; label: string }[] {
  const supportedZones: string[] =
    typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
      ? (Intl as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone')
      : [];
  const zones = supportedZones.length > 0 ? supportedZones : FALLBACK_TIMEZONES;

  return zones.map((tz) => ({
    value: tz,
    label: tz.replace(/_/g, ' '),
  }));
}

const TIMEZONE_OPTIONS = buildTimezoneOptions();

function buildTimezoneGroups(options: { value: string; label: string }[]) {
  const grouped = new Map<string, { value: string; label: string }[]>();

  options.forEach((option) => {
    const [region] = option.value.split('/');
    const groupLabel = (region ?? 'Other').replace(/_/g, ' ');
    const existing = grouped.get(groupLabel) ?? [];
    existing.push(option);
    grouped.set(groupLabel, existing);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, groupOptions]) => ({
      label,
      options: groupOptions.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}

const TIMEZONE_GROUPS = buildTimezoneGroups(TIMEZONE_OPTIONS);

interface TimezoneSectionProps {
  initialTimezone: string | null;
  onSave: (timezone: string | null) => Promise<void>;
}

export default function TimezoneSection({ initialTimezone, onSave }: TimezoneSectionProps) {
  const t = useTranslations('settings');
  const common = useTranslations('common');

  const { value: timezone, setValue: setTimezone, isSaving, feedback, handleSubmit, isDirty } = useSettingsForm({
    initialValue: initialTimezone,
    onSave,
    successMessage: t('preferences.timezoneUpdated'),
  });

  const selectOptions = [
    { value: TIMEZONE_AUTO, label: t('preferences.timezoneAuto') },
    ...TIMEZONE_GROUPS,
  ];

  return (
    <Card title={t('preferences.timezoneTitle')} description={t('preferences.timezoneDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Select
          options={selectOptions}
          value={timezone ?? TIMEZONE_AUTO}
          onChange={(value) => setTimezone(value === TIMEZONE_AUTO ? null : value)}
          placeholder={t('preferences.timezoneAuto')}
          className="min-w-[280px]"
          prefix={<Icon name="public" size={20} />}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving || !isDirty}>
            {common('save')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--text-danger)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
