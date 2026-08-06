'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button/Button';
import { TIMEZONE_AUTO } from '@/lib/timezone-mapper';
import SettingsCard from '@/layouts/SettingsLayout/SettingsCard';

type Feedback = { type: 'success' | 'error'; text: string } | null;

// Build grouped IANA timezone list once at module level (client bundle).
// Intl.supportedValuesOf is available in all modern browsers and Node 18+.
function buildTimezoneOptions(): { group: string; value: string; label: string }[] {
  const zones: string[] = typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
    ? (Intl as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone')
    : [];

  return zones.map((tz) => ({
    group: tz.includes('/') ? tz.split('/')[0] : 'Other',
    value: tz,
    label: tz.replace(/_/g, ' '),
  }));
}

const TIMEZONE_OPTIONS = buildTimezoneOptions();

interface TimezoneSectionProps {
  initialTimezone: string | null;
  onSave: (timezone: string | null) => Promise<void>;
}

export default function TimezoneSection({ initialTimezone, onSave }: TimezoneSectionProps) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [timezone, setTimezone] = useState<string | null>(initialTimezone);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => { setTimezone(initialTimezone); }, [initialTimezone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await onSave(timezone);
      setFeedback({ type: 'success', text: t('preferences.timezoneUpdated') });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  // Group options by IANA region for the optgroup structure
  const groupedOptions = Array.from(
    TIMEZONE_OPTIONS.reduce<Map<string, typeof TIMEZONE_OPTIONS>>((map, opt) => {
      const group = map.get(opt.group) ?? [];
      group.push(opt);
      map.set(opt.group, group);
      return map;
    }, new Map()),
  );

  return (
    <SettingsCard title={t('preferences.timezoneTitle')} description={t('preferences.timezoneDescription')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <select
          name="timezone"
          value={timezone ?? TIMEZONE_AUTO}
          onChange={(e) => setTimezone(e.target.value === TIMEZONE_AUTO ? null : e.target.value)}
          disabled={isSaving}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--surface-default)', color: 'var(--text-body)', minWidth: '280px' }}
        >
          <option value={TIMEZONE_AUTO}>{t('preferences.timezoneAuto')}</option>
          <optgroup label="────────────────" disabled />
          {groupedOptions.map(([group, options]) => (
            <optgroup key={group} label={group}>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button type="submit" variant="interactive" disabled={isSaving}>
            {t('preferences.saveTimezone')}
          </Button>
          {feedback && (
            <p style={{ margin: 0, color: feedback.type === 'success' ? 'var(--text-interactive)' : 'var(--color-red-500)' }}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </SettingsCard>
  );
}
