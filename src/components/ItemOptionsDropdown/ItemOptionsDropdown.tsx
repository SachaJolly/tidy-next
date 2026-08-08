'use client';

import React, { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DropdownItem, DropdownMenu, DropdownSeparator, DropdownText } from '@/components/Dropdown';
import type { ItemPreviewControls } from '@/hooks/use-item-preview-controls';
import { useQueryModal } from '@/hooks/use-query-modal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { getResolvedDisplayMode } from '@/lib/item-display-mode';
import { useOptionalListContext } from '@/app/lists/[id]/ListProvider';

import DisplayModeRadioGroup from './DisplayModeRadioGroup';

type PreviewMetadata = {
  embed?: string | null;
  videoUrl?: string | null;
};

interface ItemOptionsDropdownProps {
  itemId: string;
  viewsCount: number;
  inline?: boolean;
  authorName?: string;
  updatedAt?: string;
  metadata?: PreviewMetadata | null;
  /**
   * Preview actions owned by the card, since it is the surface that reacts to them. The
   * menu only renders the controls and words the errors.
   */
  preview?: ItemPreviewControls;
}

export default function ItemOptionsDropdown({
  itemId,
  viewsCount,
  inline = false,
  authorName,
  updatedAt,
  metadata,
  preview,
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

  // Narrowed once so the JSX below can use it without optional chaining or assertions.
  const previewControls = preview?.canEdit ? preview : null;

  // The checked option is re-resolved against the metadata, because the embed choice is
  // filtered out when nothing is embeddable: an item still stored as 'embed' would
  // otherwise leave the group with no selection at all.
  const checkedDisplayMode = useMemo(
    () => getResolvedDisplayMode(preview?.displayMode ?? 'link', metadata),
    [preview?.displayMode, metadata],
  );

  const errorMessage =
    preview?.error === 'refresh'
      ? t('refreshPreviewError')
      : preview?.error === 'displayMode'
        ? t('displayModeError')
        : null;

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

    void navigator.clipboard.writeText(`${window.location.origin}/lists/${listId}#item-${itemId}`);
  }, [itemId, listId]);

  const formatItemDate = (dateStr?: string) => (dateStr ? formatDate(dateStr, 'short') : '');

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem icon="edit" label={common('action.edit')} onSelect={handleEdit} />
          {previewControls ? (
            <DropdownItem
              icon="refresh"
              label={t('refreshPreview')}
              onSelect={previewControls.refresh}
            />
          ) : null}
          <DropdownItem icon="delete" destructive label={t('archive')} onSelect={handleArchive} />
          <DropdownSeparator />
          {previewControls ? (
            <>
              <DisplayModeRadioGroup
                value={checkedDisplayMode}
                onValueChange={previewControls.changeDisplayMode}
                metadata={metadata}
              />
              <DropdownSeparator />
            </>
          ) : null}
          {errorMessage ? (
            <DropdownText>
              <p className="text-small" style={{ color: 'var(--danger)' }}>
                {errorMessage}
              </p>
            </DropdownText>
          ) : null}
        </>
      ) : null}

      {listId ? (
        <>
          <DropdownItem icon="copy" label={common('action.copyLink')} onSelect={handleCopyLink} />
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
