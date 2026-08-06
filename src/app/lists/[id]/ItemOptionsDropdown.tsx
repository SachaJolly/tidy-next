'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/Dropdown';
import { useQueryModal } from '@/hooks/use-query-modal';

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
  const queryModal = useQueryModal();

  const handleEdit = useCallback(() => {
    queryModal.openModal('edit-item', itemId);
  }, [queryModal, itemId]);

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem
            icon="edit"
            label={common('action.edit')}
            onSelect={handleEdit}
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
