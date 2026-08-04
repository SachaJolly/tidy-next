import React from 'react';
import { cookies } from 'next/headers';
import PageLayout from '@/layouts/PageLayout';
import PageHeader from '@/components/PageHeader/PageHeader';
import Section from '@/components/Section/Section';
import Hero from '@/components/Hero/Hero';
import ProfileCard, { type ProfileCardEntry } from '@/components/ProfileCard/ProfileCard';
import { api } from '@/lib/api';
import { getTranslations } from 'next-intl/server';

const CURATORS_LIMIT = 24;
const CURATOR_RECENT_LISTS_LIMIT = 3;

type CuratorApiEntry = Omit<ProfileCardEntry, 'handle'> & {
  handle?: string;
  username?: string;
  slug?: string;
};

export default async function CuratorsContent() {
  const t = await getTranslations('curators');
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Curators is fully cacheable and now streams as its own chunk instead of
  // blocking the whole route response.
  const curators = await api.public.get<CuratorApiEntry[]>(
    `/api/v1/users/curators?users_limit=${CURATORS_LIMIT}&recent_lists_limit=${CURATOR_RECENT_LISTS_LIMIT}`,
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );
  const profileCards: ProfileCardEntry[] = curators.map((curator) => ({
    ...curator,
    handle: curator.handle ?? curator.username ?? curator.slug ?? '',
  }));

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <PageLayout>
        <PageHeader title={t('title')} caption={t('caption')} />
        <Section>
          {profileCards.map((curator) => (
            <ProfileCard key={curator.id} profile={curator} />
          ))}
        </Section>
      </PageLayout>
    </>
  );
}
