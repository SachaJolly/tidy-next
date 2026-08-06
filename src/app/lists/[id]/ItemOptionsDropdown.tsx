'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/Dropdown';

interface ItemOptionsDropdownProps {
  listId: string;
  itemId: string;
  canManage: boolean;
  inline?: boolean;
}

export default function ItemOptionsDropdown({
  listId,
  itemId,
  canManage,
  inline = false,
}: ItemOptionsDropdownProps) {
  const common = useTranslations('common');
  const t = useTranslations('ItemOptionsDropdown');

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem
            icon="edit"
            label={common('action.edit')}
            href={`/lists/${listId}?modal=edit-item&modalId=${itemId}`}
            scroll={false}
          />
          <DropdownItem icon="delete" destructive label={t('archive')} />
          <DropdownSeparator />
        </>
      ) : null}

      <DropdownItem
        icon="copy"
        label={common('action.copyLink')}
        onSelect={() =>
          void navigator.clipboard.writeText(
            `${window.location.origin}/lists/${listId}#item-${itemId}`,
          )
        }
      />
    </DropdownMenu>
  );
}
