'use server';

import { revalidatePath } from 'next/cache';

import { fetchLinkMetadataAction } from '@/actions/fetch-link-metadata';
import type { ItemLinkDisplayMode } from '@/components/ItemLink/ItemLink.types';
import { api, ApiFetchError } from '@/lib/api';
import { getResolvedDisplayMode } from '@/lib/item-display-mode';
import type { Item } from '@/lib/types';

// This type reflects what the ItemForm now sends
type ItemFormPayload = {
  body: string; // This is the markdown content from the textarea
  url: string | null; // This is the extracted URL
  display_mode: 'text' | 'link' | 'bookmark' | 'embed';
  metadata?: Record<string, unknown>; // The metadata from the link preview
};

export type ItemMutationResult = {
  error?: string;
  item?: Item;
};

export async function createListItemAction(
  listId: string,
  // Use the new ItemFormPayload type
  { body, url, display_mode, metadata }: ItemFormPayload,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.post<Item>(
      `/api/v1/lists/${listId}/items`,
      {
        item: {
          body,
          url: url || undefined,
          display_mode,
          metadata: metadata || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item creation failed.' };
    }

    // Invalidate all relevant paths to ensure data freshness
    revalidatePath(`/lists/${listId}`);
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath('/', 'layout');

    return { item };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

export async function updateListItemAction(
  listId: string,
  itemId: string,
  // Use the new ItemFormPayload type
  { body, url, display_mode, metadata }: ItemFormPayload,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      {
        item: {
          body,
          url: url || undefined,
          display_mode,
          metadata: metadata || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item update failed.' };
    }

    // Invalidate all relevant paths to ensure data freshness
    revalidatePath(`/lists/${listId}`);
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath('/', 'layout');

    return { item };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

export async function archiveListItemAction(
  listId: string,
  itemId: string,
): Promise<ItemMutationResult> {
  try {
    const archivedItem = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      {
        item: {
          status: 'ARCHIVED',
        },
      },
      { cache: 'no-store' },
    );

    revalidatePath(`/lists/${listId}`);
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath('/', 'layout');

    return { item: archivedItem ?? undefined };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

/**
 * Restates an item's link and display mode on every write.
 *
 * The URL is not a column on the API side: the model keeps it inside `metadata`, so any
 * write that replaces that JSON has to put the link back or lose it. Sending the mode
 * alongside keeps each request self-describing instead of depending on how the API
 * completes a partial payload.
 *
 * Ownership is enforced server-side by `ensure_list_author!`, so taking the URL from the
 * caller grants nothing an owner could not already do through the edit form.
 */
function itemLinkPayload(url: string, displayMode: ItemLinkDisplayMode) {
  return { url, display_mode: displayMode };
}

/**
 * Revalidates the surfaces an item appears on.
 *
 * Deliberately narrower than the mutations above: those call `revalidatePath('/', 'layout')`,
 * which re-renders every route segment and remounts each embedded iframe on the page. Touching
 * one card must not reload every video in the list.
 */
function revalidateItemSurfaces(listId: string) {
  revalidatePath(`/lists/${listId}`);
  revalidatePath('/discover');
  revalidatePath('/latest');
}

/**
 * Re-reads an item's link preview from the source page and stores the result.
 *
 * The refresh button inside `ItemForm` only refills React state, and nothing is written
 * until the user saves, which is right for a form they may cancel. The item dropdown on
 * the list page has no such step, so this action has to fetch *and* persist in one go.
 */
export async function refreshItemMetadataAction(
  listId: string,
  itemId: string,
  url: string,
  displayMode: ItemLinkDisplayMode,
): Promise<ItemMutationResult> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { error: 'This item has no link to refresh.' };
  }

  const { metadata, error: metadataError } = await fetchLinkMetadataAction(trimmedUrl);
  if (metadataError || !metadata) {
    return { error: metadataError ?? 'Could not load link metadata.' };
  }

  try {
    const item = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      {
        item: {
          // A refresh replaces the stored metadata rather than merging into it. Keeping
          // old keys would make it impossible to ever drop an image or title the page no
          // longer serves. The URL is restated because it lives inside this same JSON.
          ...itemLinkPayload(
            trimmedUrl,
            // The page may have lost whatever made it embeddable. Without this the item
            // would keep claiming a mode its metadata can no longer render.
            getResolvedDisplayMode(displayMode, metadata),
          ),
          metadata: { ...metadata, url: trimmedUrl },
        },
      },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item preview refresh failed.' };
    }

    revalidateItemSurfaces(listId);

    return { item };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

/**
 * Switches how an item renders its link, straight from the list page.
 *
 * Mirrors `updateListVisibilityAction`: one narrow write instead of routing the user
 * through the edit modal for a single field.
 */
export async function updateItemDisplayModeAction(
  listId: string,
  itemId: string,
  url: string,
  displayMode: ItemLinkDisplayMode,
): Promise<ItemMutationResult> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { error: 'This item has no link to display.' };
  }

  try {
    const item = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      // `metadata` is left out on purpose: omitting it keeps the stored preview untouched,
      // where sending a partial copy would overwrite the whole JSON column.
      { item: itemLinkPayload(trimmedUrl, displayMode) },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item display mode update failed.' };
    }

    revalidateItemSurfaces(listId);

    return { item };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}
