'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import {DropdownItem, DropdownMenu, DropdownSeparator, DropdownText} from '@/components/Dropdown';
import { useQueryModal } from '@/hooks/use-query-modal';

interface ItemOptionsDropdownProps {
  listId: string;
  itemId: string;
  viewsCount: number;
  canManage: boolean;
  inline?: boolean;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ItemOptionsDropdown({
  listId,
  itemId,
  viewsCount,
  canManage,
  inline = false,
  authorName,
  createdAt,
  updatedAt,
}: ItemOptionsDropdownProps) {
  const common = useTranslations('common');
  const t = useTranslations('ItemOptionsDropdown');
  const queryModal = useQueryModal();

  const handleEdit = useCallback(() => {
    queryModal.openModal('edit-item', itemId);
  }, [queryModal, itemId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
      <DropdownSeparator />
      <DropdownText>
        {authorName && <p className="text-small text-muted">{t('addedBy', { author: authorName })}</p>}
        {updatedAt && <p className="text-small text-muted">{t('lastUpdated', { date: formatDate(updatedAt) })}</p>}
        {canManage && <p className="text-small text-muted">{t('viewsCount', {count: viewsCount})}</p>}
      </DropdownText>
    </DropdownMenu>
  );
}
