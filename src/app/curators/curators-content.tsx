import React from 'react';
import { cookies } from 'next/headers';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import Section from '@/components/section/section';
import Hero from '@/components/hero/hero';
import CuratorMeta, { type CuratorEntry } from '@/components/curator-meta/curator-meta';
import { api } from '@/lib/api';
import { getTranslations } from 'next-intl/server';

const CURATORS_LIMIT = 24;
const CURATOR_RECENT_LISTS_LIMIT = 3;

export default async function CuratorsContent() {
  const t = await getTranslations('curators');
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get('tidy_token');

  // Curators is fully cacheable and now streams as its own chunk instead of
  // blocking the whole route response.
  const curators = await api.public.get<CuratorEntry[]>(
    `/api/v1/users/curators?users_limit=${CURATORS_LIMIT}&recent_lists_limit=${CURATOR_RECENT_LISTS_LIMIT}`,
    {
      cache: 'force-cache',
      revalidate: 60,
    },
  );

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <Page>
        <PageHeader title={t('title')} caption={t('caption')} />
        <Section>
          {curators.map((curator) => (
            <CuratorMeta key={curator.id} profile={curator} />
          ))}
        </Section>
      </Page>
    </>
  );
}
