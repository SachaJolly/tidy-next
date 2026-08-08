'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { refreshItemMetadataAction, updateItemDisplayModeAction } from '@/actions/items';
import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';
import { toItemLinkDisplayMode } from '@/lib/item-display-mode';

/** Which write failed. The hook stays out of i18n and lets the menu word the message. */
export type ItemPreviewErrorKind = 'refresh' | 'displayMode';

export interface ItemPreviewControls {
  /** False when the viewer cannot manage the list, or the item has no link to act on. */
  canEdit: boolean;
  /** The shape to render right now: optimistic during a mode change, stored otherwise. */
  displayMode: ItemLinkDisplayMode;
  isPending: boolean;
  error: ItemPreviewErrorKind | null;
  refresh: () => void;
  changeDisplayMode: (value: string) => void;
}

interface UseItemPreviewControlsParams {
  itemId: string;
  listId?: string;
  url?: string | null;
  displayMode?: string | null;
  canManage: boolean;
}

/**
 * The two preview writes an item exposes from its dropdown: refetch the link, or switch how
 * it renders.
 *
 * This lives in a hook rather than inside `ItemOptionsDropdown` because the menu is not the
 * only thing that reacts to it. The card has to swap itself for a skeleton while a write is
 * in flight, and the card is the dropdown's *parent*. Holding the state in the menu would
 * mean pushing it back up through a callback and keeping two copies of "is it running" in
 * step. Both consumers read the same hook instead, from their nearest shared owner.
 */
export function useItemPreviewControls({
  itemId,
  listId,
  url,
  displayMode,
  canManage,
}: UseItemPreviewControlsParams): ItemPreviewControls {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ItemPreviewErrorKind | null>(null);

  const linkUrl = typeof url === 'string' && url.trim().length > 0 ? url.trim() : null;
  // Presence of a link — not of metadata — is the gate: an item can hold a URL whose
  // preview failed to load, and that is precisely when refreshing is worth offering.
  const canEdit = canManage && !!linkUrl && !!listId;

  // Optimistic copy of the mode, so the card and the radio react on click instead of
  // waiting for the round-trip. It is re-seeded during render whenever the server sends a
  // different value; without that the item would keep showing a stale shape after a refresh
  // re-resolved it. `useOptimistic` would read better but reverts as soon as its transition
  // ends, and `router.refresh()` is not awaited by that transition, so the previous mode
  // would flash back before the fresh data lands.
  const serverDisplayMode = toItemLinkDisplayMode(displayMode);
  const [mode, setMode] = useState<ItemLinkDisplayMode>(serverDisplayMode);
  const [syncedMode, setSyncedMode] = useState<ItemLinkDisplayMode>(serverDisplayMode);
  if (syncedMode !== serverDisplayMode) {
    setSyncedMode(serverDisplayMode);
    setMode(serverDisplayMode);
  }

  const refresh = useCallback(() => {
    if (!canEdit || !listId || !linkUrl || isPending) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await refreshItemMetadataAction(listId, itemId, linkUrl, mode);
      if (result.error) {
        setError('refresh');
        return;
      }

      router.refresh();
    });
  }, [canEdit, isPending, itemId, linkUrl, listId, mode, router]);

  const changeDisplayMode = useCallback(
    (value: string) => {
      const nextMode = toItemLinkDisplayMode(value);
      if (!canEdit || !listId || !linkUrl || isPending || nextMode === mode) {
        return;
      }

      const previousMode = mode;
      setMode(nextMode);
      setError(null);

      startTransition(async () => {
        const result = await updateItemDisplayModeAction(listId, itemId, linkUrl, nextMode);
        if (result.error) {
          setMode(previousMode);
          setError('displayMode');
          return;
        }

        router.refresh();
      });
    },
    [canEdit, isPending, itemId, linkUrl, listId, mode, router],
  );

  return { canEdit, displayMode: mode, isPending, error, refresh, changeDisplayMode };
}
