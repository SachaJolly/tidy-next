'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DropdownLabel, DropdownRadioGroup, DropdownRadioItem } from '@/components/Dropdown';
import type { IconName } from '@/components/Icon/icons';
import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';
import { isDisplayModeAvailable } from '@/lib/item-display-mode';

type DisplayModeMetadata =
  | {
      embed?: string | null;
      videoUrl?: string | null;
    }
  | null
  | undefined;

const DISPLAY_MODE_OPTIONS: ReadonlyArray<{
  value: ItemLinkDisplayMode;
  labelKey: string;
  icon: IconName;
}> = [
  { value: 'link', labelKey: 'item.displayModes.link', icon: 'link' },
  { value: 'bookmark', labelKey: 'item.displayModes.bookmark', icon: 'bookmark' },
  { value: 'embed', labelKey: 'item.displayModes.embed', icon: 'play' },
];

interface DisplayModeRadioGroupProps {
  value: ItemLinkDisplayMode;
  onValueChange: (value: string) => void;
  /** The item's stored preview, used to tell which modes it can actually render. */
  metadata: DisplayModeMetadata;
  showLabel?: boolean;
}

/**
 * Display mode picker for the item dropdown, the counterpart of VisibilityRadioGroup.
 *
 * A mode the metadata cannot render is left out entirely rather than shown disabled. The
 * preview inside the edit form disables it instead, because there the user can refetch the
 * link and unlock it; from a dropdown there is nothing to act on, so the option would only
 * be noise. Filtering also keeps the menu honest: it never offers something that would
 * silently fall back to another mode once saved.
 */
export default function DisplayModeRadioGroup({
  value,
  onValueChange,
  metadata,
  showLabel = true,
}: DisplayModeRadioGroupProps) {
  const t = useTranslations('forms');

  const availableOptions = useMemo(
    () => DISPLAY_MODE_OPTIONS.filter((option) => isDisplayModeAvailable(option.value, metadata)),
    [metadata],
  );

  return (
    <>
      {showLabel && <DropdownLabel>{t('item.displayModeLabel')}</DropdownLabel>}
      <DropdownRadioGroup value={value} onValueChange={onValueChange}>
        {availableOptions.map((option) => (
          <DropdownRadioItem
            key={option.value}
            value={option.value}
            icon={option.icon}
            label={t(option.labelKey)}
          />
        ))}
      </DropdownRadioGroup>
    </>
  );
}
