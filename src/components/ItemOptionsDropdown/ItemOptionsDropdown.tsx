'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { DropdownItem, DropdownMenu, DropdownSeparator, DropdownText } from '@/components/Dropdown';
import { useQueryModal } from '@/hooks/use-query-modal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useOptionalListContext } from '@/app/lists/[id]/ListProvider';

interface ItemOptionsDropdownProps {
  itemId: string;
  viewsCount: number;
  inline?: boolean;
  authorName?: string;
  updatedAt?: string;
}

export default function ItemOptionsDropdown({
  itemId,
  viewsCount,
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
  const listContext = useOptionalListContext();
  const canManage = listContext?.canManage ?? false;
  const listId = listContext?.list.id;

  const handleEdit = useCallback(() => {
    queryModal.openModal('edit-item', itemId);
  }, [queryModal, itemId]);

  const handleArchive = useCallback(() => {
    deleteQueryModal.openModal('delete', itemId);
  }, [deleteQueryModal, itemId]);

  const handleCopyLink = useCallback(() => {
    if (!listId) {
      return;
    }

    void navigator.clipboard.writeText(
      `${window.location.origin}/lists/${listId}#item-${itemId}`,
    );
  }, [itemId, listId]);

  const formatItemDate = (dateStr?: string) => (dateStr ? formatDate(dateStr, 'short') : '');

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem icon="edit" label={common('action.edit')} onSelect={handleEdit} />
          <DropdownItem icon="delete" destructive label={t('archive')} onSelect={handleArchive} />
          <DropdownSeparator />
        </>
      ) : null}

      {listId ? (
        <>
          <DropdownItem
            icon="copy"
            label={common('action.copyLink')}
            onSelect={handleCopyLink}
          />
          <DropdownSeparator />
        </>
      ) : null}

      <DropdownText>
        {authorName && (
          <p className="text-small text-muted">{t('addedBy', { author: authorName })}</p>
        )}
        {updatedAt && (
          <p className="text-small text-muted">
            {date('lastUpdated', { date: formatItemDate(updatedAt) })}
          </p>
        )}
        {canManage && (
          <p className="text-small text-muted">{t('viewsCount', { count: viewsCount })}</p>
        )}
      </DropdownText>
    </DropdownMenu>
  );
}
