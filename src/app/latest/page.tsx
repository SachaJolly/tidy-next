import React from 'react';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import Hero from '@/components/hero/hero';

import { api } from '@/lib/api';
import { List } from '@/lib/types';

import { getAuthStatus } from '@/lib/auth';

const Discover = async () => {
  // We now await the getAuthStatus function, as it correctly handles the async nature of cookies().
  const isAuthenticated = await getAuthStatus();

  const latestLists = await api.get<List[]>('/api/v1/lists/latest');

  const latestToDisplay = latestLists.slice(0, 32);

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <Page>
        <PageHeader
          title="Latest lists"
          caption="Discover the latest lists published on TidyCards."
        />
        <Section>
          <SectionHeader title="Last lists" />
          <CollectionList>
            {latestToDisplay.map((list) => (
              <ListCard list={list} key={list.id} />
            ))}
          </CollectionList>
        </Section>
      </Page>
    </>
  );
};

export default Discover;
