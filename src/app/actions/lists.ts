'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';

type ListMutationInput = {
  title: string;
  description: string;
};
type ListVisibility = List['visibility'];

export type ListMutationResult = {
  error?: string;
  list?: List;
};

export async function createListAction({
  title,
  description,
}: ListMutationInput): Promise<ListMutationResult> {
  try {
    const list = await api.auth.post<List>(
      '/api/v1/lists',
      {
        list: {
          title,
          description: description || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!list) {
      return { error: 'List creation failed.' };
    }

    revalidatePath('/', 'layout');

    return { list };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

export async function updateListAction(
  listId: string,
  { title, description }: ListMutationInput,
): Promise<ListMutationResult> {
  try {
    const list = await api.auth.patch<List>(
      `/api/v1/lists/${listId}`,
      {
        list: {
          title,
          description: description || undefined,
        },
      },
      { cache: 'no-store' },
    );

    if (!list) {
      return { error: 'List update failed.' };
    }

    revalidatePath('/', 'layout');
    revalidatePath(`/lists/${listId}`);

    return { list };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}

export async function updateListVisibilityAction(
  listId: string,
  visibility: ListVisibility,
): Promise<ListMutationResult> {
  try {
    const list = await api.auth.patch<List>(
      `/api/v1/lists/${listId}`,
      {
        list: {
          visibility,
        },
      },
      { cache: 'no-store' },
    );

    if (!list) {
      return { error: 'List visibility update failed.' };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');
    revalidatePath('/discover');
    revalidatePath('/latest');
    revalidatePath(`/lists/${listId}`);

    return { list };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return { error: error.message };
    }

    return { error: 'An unknown error occurred.' };
  }
}
