'use client';

import React from 'react';
import { DropdownRadioGroup, DropdownRadioItem, DropdownLabel } from '@/components/Dropdown';
import type { IconName } from '@/components/Icon/icons';
import { useTranslations } from 'next-intl';

type VisibilityValue =
  'PUBLIC' | 'UNINDEXED' | 'PRIVATE' | 'published' | 'unindexed' | 'restricted';
type NormalizedVisibilityValue = 'published' | 'unindexed' | 'restricted';

interface VisibilityRadioGroupProps {
  value: VisibilityValue;
  onValueChange: (value: string) => void;
  showLabel?: boolean;
}

// Normalized visibility options with consistent structure
const VISIBILITY_OPTIONS: Array<{
  values: VisibilityValue[];
  normalizedValue: NormalizedVisibilityValue;
  labelKey: string;
  captionKey: string;
  icon: IconName;
}> = [
  {
    values: ['PUBLIC', 'published'],
    normalizedValue: 'published',
    labelKey: 'visibility.public.label',
    captionKey: 'visibility.public.caption',
    icon: 'public',
  },
  {
    values: ['UNINDEXED', 'unindexed'],
    normalizedValue: 'unindexed',
    labelKey: 'visibility.unindexed.label',
    captionKey: 'visibility.unindexed.caption',
    icon: 'visibility_off',
  },
  {
    values: ['PRIVATE', 'restricted'],
    normalizedValue: 'restricted',
    labelKey: 'visibility.private.label',
    captionKey: 'visibility.private.caption',
    icon: 'private',
  },
];

function normalizeVisibility(value: VisibilityValue): NormalizedVisibilityValue {
  const mapping: Record<VisibilityValue, NormalizedVisibilityValue> = {
    PUBLIC: 'published',
    UNINDEXED: 'unindexed',
    PRIVATE: 'restricted',
    published: 'published',
    unindexed: 'unindexed',
    restricted: 'restricted',
  };

  return mapping[value];
}

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
  const normalizedValue = normalizeVisibility(value);

  return (
    <>
      {showLabel && <DropdownLabel>{tCommon('visibility.label')}</DropdownLabel>}
      <DropdownRadioGroup value={normalizedValue} onValueChange={onValueChange}>
        {VISIBILITY_OPTIONS.map((option) => (
          <DropdownRadioItem
            key={option.normalizedValue}
            value={option.normalizedValue}
            icon={option.icon}
            label={tCommon(option.labelKey)}
            caption={tCommon(option.captionKey)}
          />
        ))}
      </DropdownRadioGroup>
    </>
  );
}
