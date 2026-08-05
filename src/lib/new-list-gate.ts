import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { api, ApiFetchError } from '@/lib/api';
import type { List, NewListGate, User } from '@/lib/types';

export const UNCONFIRMED_LIST_LIMIT = 3;

type MeUser = User & {
  confirmedAt?: string | null;
  emailConfirmed?: boolean;
};

export const getNewListGate = cache(async (): Promise<NewListGate> => {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('tidy_token')?.value ?? null;

  // If not authenticated, return early with default values
  if (!authToken) {
    return {
      emailConfirmed: true,
      limitReached: false,
    };
  }

  try {
    const user = await api.auth.get<MeUser>('/api/v1/me', {
      authorization: authToken,
      cache: 'no-store',
    });

    if (!user) {
      return {
        emailConfirmed: true,
        limitReached: false,
      };
    }

    const emailConfirmed = user.emailConfirmed === true || !!user.confirmedAt;

    if (emailConfirmed) {
      return {
        emailConfirmed: true,
        limitReached: false,
      };
    }

    const lists = await api.auth.get<List[]>(
      `/api/v1/me/lists?limit=${UNCONFIRMED_LIST_LIMIT}`,
      {
        authorization: authToken,
        cache: 'no-store',
      },
    );

    return {
      emailConfirmed: false,
      limitReached: (lists?.length ?? 0) >= UNCONFIRMED_LIST_LIMIT,
    };
  } catch (error) {
    if (error instanceof ApiFetchError) {
      return {
        emailConfirmed: false,
        limitReached: false,
      };
    }

    throw error;
  }
});
