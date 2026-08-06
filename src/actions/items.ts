'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiFetchError } from '@/lib/api';
import type { Item } from '@/lib/types';

type ItemMutationInput = {
  body: string;
  display_mode: 'text' | 'link' | 'bookmark' | 'embed';
  url?: string;
  metadata?: Item['metadata'];
};

export type ItemMutationResult = {
  error?: string;
  item?: Item;
};

export async function createListItemAction(
  listId: string,
  { body, display_mode, url, metadata }: ItemMutationInput,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.post<Item>(
      `/api/v1/lists/${listId}/items`,
      {
        item: {
          body,
          display_mode,
          url: url || undefined,
          metadata: metadata || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item creation failed.' };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath(`/lists/${listId}`);

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
  { body, display_mode, url, metadata }: ItemMutationInput,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      {
        item: {
          body,
          display_mode,
          url: url || undefined,
          metadata: metadata || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!item) {
      return { error: 'Item update failed.' };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath(`/lists/${listId}`);

    return { item };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}
