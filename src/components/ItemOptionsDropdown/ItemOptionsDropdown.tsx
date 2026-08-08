'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import {DropdownItem, DropdownMenu, DropdownSeparator, DropdownText} from '@/components/Dropdown';
import { useQueryModal } from '@/hooks/use-query-modal';
import { useDateFormatter } from '@/hooks/use-date-formatter';

interface ItemOptionsDropdownProps {
  listId: string;
  itemId: string;
  viewsCount: number;
  canManage: boolean;
  inline?: boolean;
  authorName?: string;
  updatedAt?: string;
}

export default function ItemOptionsDropdown({
  listId,
  itemId,
  viewsCount,
  canManage,
  inline = false,
  authorName,
  updatedAt,
}: ItemOptionsDropdownProps) {
  const common = useTranslations('common');
  const t = useTranslations('ItemOptionsDropdown');
  const date = useTranslations('date');
  const formatDate = useDateFormatter();
  const queryModal = useQueryModal();
  const deleteQueryModal = useQueryModal({ modalIdKey: 'id' });

  const handleEdit = useCallback(() => {
    queryModal.openModal('edit-item', itemId);
  }, [queryModal, itemId]);

  const handleArchive = useCallback(() => {
    deleteQueryModal.openModal('delete', itemId);
  }, [deleteQueryModal, itemId]);

  const formatItemDate = (dateStr?: string) =>
    dateStr ? formatDate(dateStr, 'short') : '';

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem
            icon="edit"
            label={common('action.edit')}
            onSelect={handleEdit}
          />
          <DropdownItem icon="delete" destructive label={t('archive')} onSelect={handleArchive} />
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
      <DropdownSeparator />
      <DropdownText>
        {authorName && <p className="text-small text-muted">{t('addedBy', { author: authorName })}</p>}
        {updatedAt && <p className="text-small text-muted">{date('lastUpdated', { date: formatItemDate(updatedAt) })}</p>}
        {canManage && <p className="text-small text-muted">{t('viewsCount', {count: viewsCount})}</p>}
      </DropdownText>
    </DropdownMenu>
  );
}
