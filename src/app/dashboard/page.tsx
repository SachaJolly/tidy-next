import { redirect } from 'next/navigation';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import CollectionList from '@/components/collection-list/collection-list';
import Section from '@/components/section/section';
import SectionHeader from '@/components/section-header/section-header';
import ListCard from '@/components/list-card/list-card';
import MetaGroup from '@/components/meta-group/meta-group';
import Meta from '@/components/meta/meta';
import { api, ApiFetchError } from '@/lib/api';
import { List } from '@/lib/types';

export default async function Dashboard() {
  try {
    // Protected pages should fail closed before any data is fetched.
    // The wrapper reads the session cookie and returns null if the user is not
    // authenticated, which prevents an unnecessary round-trip to Rails.
    const lists = await api.auth.get<List[]>('/api/v1/me/lists', {
      cache: 'no-store',
    });

    if (!lists) {
      redirect('/signin');
    }

    return (
      <Page>
        <PageHeader
          title="Dashboard"
          caption="Create, organise and collaborate on your lists and collections."
        />
        <Section>
          <SectionHeader title="My lists">
            <MetaGroup>
              <Meta>Default collection</Meta>
              <Meta>Only public lists are visible to everyone</Meta>
            </MetaGroup>
          </SectionHeader>
          <CollectionList>
            {lists.length > 0 ? (
              lists.map((list) => <ListCard list={list} key={list.id} />)
            ) : (
              <p>You haven't created any lists yet.</p>
            )}
          </CollectionList>
        </Section>
      </Page>
    );
  } catch (error: unknown) {
    if (error instanceof ApiFetchError && error.status === 401) {
      redirect('/signin');
    }

    throw error;
  }
}
