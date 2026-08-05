import 'server-only';

import { cache } from 'react';

import { api, ApiFetchError } from '@/lib/api';
import type { List, NewListGate, User } from '@/lib/types';

export const UNCONFIRMED_LIST_LIMIT = 3;

type MeUser = User & {
  confirmedAt?: string | null;
  emailConfirmed?: boolean;
};

export const getNewListGate = cache(async (): Promise<NewListGate> => {
  const user = await api.auth.get<MeUser>('/api/v1/me', {
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

  try {
    const lists = await api.auth.get<List[]>(
      `/api/v1/me/lists?limit=${UNCONFIRMED_LIST_LIMIT}`,
      {
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
