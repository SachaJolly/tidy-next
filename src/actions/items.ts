'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiFetchError } from '@/lib/api';
import type { Item } from '@/lib/types';

type ItemMutationInput = {
  title: string;
  caption?: string;
  url?: string;
};

export type ItemMutationResult = {
  error?: string;
  item?: Item;
};

export async function createListItemAction(
  listId: string,
  { title, caption, url }: ItemMutationInput,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.post<Item>(
      `/api/v1/lists/${listId}/items`,
      {
        item: {
          title,
          caption: caption || undefined,
          item_type: 'URL',
          display_mode: 'LINK',
          metadata: {
            url: url || undefined,
          },
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
  { title, caption, url }: ItemMutationInput,
): Promise<ItemMutationResult> {
  try {
    const item = await api.auth.patch<Item>(
      `/api/v1/lists/${listId}/items/${itemId}`,
      {
        item: {
          title,
          caption: caption || undefined,
          metadata: {
            url: url || undefined,
          },
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
