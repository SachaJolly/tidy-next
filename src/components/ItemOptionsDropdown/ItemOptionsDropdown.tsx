'use client';

import React, { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { refreshItemMetadataAction, updateItemDisplayModeAction } from '@/actions/items';
import { DropdownItem, DropdownMenu, DropdownSeparator, DropdownText } from '@/components/Dropdown';
import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';
import { useQueryModal } from '@/hooks/use-query-modal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { getResolvedDisplayMode } from '@/lib/item-display-mode';
import type { Item } from '@/lib/types';
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
  /**
   * The item's link. Its presence — not the display mode — is what decides whether the
   * preview entries show up: an item can hold a URL whose metadata failed to load, and
   * that is exactly when refreshing is most useful.
   */
  url?: string | null;
  initialDisplayMode?: Item['display_mode'];
  metadata?: PreviewMetadata | null;
}

/** Narrows the stored mode to the three the preview can render, ignoring 'text'. */
function toLinkDisplayMode(mode: Item['display_mode'] | undefined): ItemLinkDisplayMode {
  return mode === 'link' || mode === 'bookmark' || mode === 'embed' ? mode : 'bookmark';
}

export default function ItemOptionsDropdown({
  itemId,
  viewsCount,
  inline = false,
  authorName,
  updatedAt,
  url,
  initialDisplayMode,
  metadata,
}: ItemOptionsDropdownProps) {
  const common = useTranslations('common');
  const t = useTranslations('ItemOptionsDropdown');
  const date = useTranslations('date');
  const formatDate = useDateFormatter();
  const router = useRouter();
  const queryModal = useQueryModal();
  const deleteQueryModal = useQueryModal({ modalIdKey: 'id' });
  const listContext = useOptionalListContext();
  const canManage = listContext?.canManage ?? false;
  const listId = listContext?.list.id;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const linkUrl = typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
  // Only an owner can change anything here, and only a link has a preview to change.
  const canEditPreview = canManage && !!linkUrl && !!listId;

  // The stored mode is re-resolved against the metadata so the checked option matches what
  // the card actually renders: ItemLink falls back to bookmark when nothing is embeddable,
  // and the embed option is filtered out in that case, which would otherwise leave the
  // group with no selection at all.
  const serverDisplayMode = useMemo(
    () => getResolvedDisplayMode(toLinkDisplayMode(initialDisplayMode), metadata),
    [initialDisplayMode, metadata],
  );

  // Optimistic copy of the mode, so the radio reacts on click instead of waiting for the
  // round-trip. It is re-seeded during render whenever the server sends a different value —
  // without that the menu would keep showing a stale mode after a refresh re-resolved it.
  // `useOptimistic` would look tidier but reverts as soon as its transition ends, and
  // `router.refresh()` is not awaited by that transition, so the old value would flash back.
  const [displayMode, setDisplayMode] = useState<ItemLinkDisplayMode>(serverDisplayMode);
  const [syncedDisplayMode, setSyncedDisplayMode] = useState<ItemLinkDisplayMode>(serverDisplayMode);
  if (syncedDisplayMode !== serverDisplayMode) {
    setSyncedDisplayMode(serverDisplayMode);
    setDisplayMode(serverDisplayMode);
  }

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

  const handleRefreshPreview = useCallback(() => {
    if (!listId || !linkUrl || isPending) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await refreshItemMetadataAction(listId, itemId, linkUrl, displayMode);
      if (result.error) {
        setError(t('refreshPreviewError'));
        return;
      }

      router.refresh();
    });
  }, [displayMode, isPending, itemId, linkUrl, listId, router, t]);

  const handleDisplayModeChange = useCallback(
    (value: string) => {
      const nextDisplayMode = value as ItemLinkDisplayMode;
      if (!listId || !linkUrl || isPending || nextDisplayMode === displayMode) {
        return;
      }

      const previousDisplayMode = displayMode;
      setDisplayMode(nextDisplayMode);
      setError(null);

      startTransition(async () => {
        const result = await updateItemDisplayModeAction(
          listId,
          itemId,
          linkUrl,
          nextDisplayMode,
        );

        if (result.error) {
          setDisplayMode(previousDisplayMode);
          setError(t('displayModeError'));
          return;
        }

        router.refresh();
      });
    },
    [displayMode, isPending, itemId, linkUrl, listId, router, t],
  );

  const formatItemDate = (dateStr?: string) => (dateStr ? formatDate(dateStr, 'short') : '');

  return (
    <DropdownMenu align="end" inline={inline}>
      {canManage ? (
        <>
          <DropdownItem icon="edit" label={common('action.edit')} onSelect={handleEdit} />
          {canEditPreview ? (
            <DropdownItem
              icon="refresh"
              label={t('refreshPreview')}
              onSelect={handleRefreshPreview}
            />
          ) : null}
          <DropdownItem icon="delete" destructive label={t('archive')} onSelect={handleArchive} />
          <DropdownSeparator />
          {canEditPreview ? (
            <>
              <DisplayModeRadioGroup
                value={displayMode}
                onValueChange={handleDisplayModeChange}
                metadata={metadata}
              />
              <DropdownSeparator />
            </>
          ) : null}
          {error ? (
            <DropdownText>
              <p className="text-small" style={{ color: 'var(--danger)' }}>
                {error}
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
