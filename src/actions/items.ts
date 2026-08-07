'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiFetchError } from '@/lib/api';
import type { Item } from '@/lib/types';

// This type reflects what the ItemForm now sends
type ItemFormPayload = {
  body: string; // This is the markdown content from the textarea
  url: string | null; // This is the extracted URL
  display_mode: 'text' | 'link' | 'bookmark' | 'embed';
  metadata?: Record<string, any>; // The metadata from the link preview
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
