'use client';

import React from 'react';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import { DropdownRadioGroup, DropdownRadioItem, DropdownLabel } from '@/components/Dropdown';
import { useTranslations } from 'next-intl';

type VisibilityValue = 'PUBLIC' | 'UNINDEXED' | 'PRIVATE' | 'published' | 'unindexed' | 'restricted';

interface VisibilityRadioGroupProps {
  value: VisibilityValue;
  onValueChange: (value: string) => void;
  showLabel?: boolean;
}

// Normalized visibility options with consistent structure
const VISIBILITY_OPTIONS: Array<{
  values: VisibilityValue[];
  labelKey: string;
  captionKey: string;
  icon: IconName;
}> = [
  {
    values: ['PUBLIC', 'published'],
    labelKey: 'visibility.public.label',
    captionKey: 'visibility.public.caption',
    icon: 'public',
  },
  {
    values: ['UNINDEXED', 'unindexed'],
    labelKey: 'visibility.unindexed.label',
    captionKey: 'visibility.unindexed.caption',
    icon: 'visibility_off',
  },
  {
    values: ['PRIVATE', 'restricted'],
    labelKey: 'visibility.private.label',
    captionKey: 'visibility.private.caption',
    icon: 'private',
  },
];

/**
 * Reusable visibility radio group for dropdowns.
 * Normalizes between API values (PUBLIC, UNINDEXED, PRIVATE)
 * and form values (published, unindexed, restricted).
 */
export default function VisibilityRadioGroup({
  value,
  onValueChange,
  showLabel = true,
}: VisibilityRadioGroupProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('forms');

  // Find the option group that contains the current value
  const currentOption = VISIBILITY_OPTIONS.find(opt => opt.values.includes(value));

  return (
    <>
      {showLabel && <DropdownLabel>{tCommon('action.setVisibility')}</DropdownLabel>}
      <DropdownRadioGroup value={value} onValueChange={onValueChange}>
        {VISIBILITY_OPTIONS.map(option => (
          <DropdownRadioItem
            key={option.icon}
            value={option.values[0]}
            icon={option.icon}
            label={tCommon(option.labelKey)}
            caption={tCommon(option.captionKey)}
          />
        ))}
      </DropdownRadioGroup>
    </>
  );
}
