import React from 'react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import CuratorsContent from './CuratorsContent';
import { api } from '@/lib/api';
import { type ProfileCardEntry } from '@/components/ProfileCard/ProfileCard';

const CURATORS_LIMIT = 24;
const CURATOR_RECENT_LISTS_LIMIT = 3;

type CuratorApiEntry = Omit<ProfileCardEntry, 'handle'> & {
  handle?: string;
  username?: string;
  slug?: string;
};

export default async function CuratorsPage() {
  const t = await getTranslations('curators');
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');
  const curators = await api.public.get<CuratorApiEntry[]>(
    `/api/v1/users/curators?users_limit=${CURATORS_LIMIT}&recent_lists_limit=${CURATOR_RECENT_LISTS_LIMIT}`,
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );

  return (
    <CuratorsContent
      isAuthenticated={isAuthenticated}
      title={t('title')}
      caption={t('caption')}
      curators={curators}
    />
  );
}
