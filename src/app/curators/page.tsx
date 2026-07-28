import React from 'react';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import Section from '@/components/section/section';
import Hero from '@/components/hero/hero';
import CuratorMeta, { type CuratorEntry } from '@/components/curator-meta/curator-meta';

import { api } from '@/lib/api';
import { getAuthStatus } from '@/lib/auth';

const Curators = async () => {
  const isAuthenticated = await getAuthStatus();
  const curators = await api.get<CuratorEntry[]>('/api/v1/users/curators');

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <Page>
        <PageHeader
          title="Curators"
          caption="Discover the people behind the best lists on TidyCards."
        />
        <Section>
          {curators.map((curator) => (
            <CuratorMeta key={curator.id} profile={curator} />
          ))}
        </Section>
      </Page>
    </>
  );
};

export default Curators;
