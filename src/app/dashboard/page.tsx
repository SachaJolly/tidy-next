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
import { getTranslations } from 'next-intl/server';

const DASHBOARD_LIST_LIMIT = 32;

export default async function Dashboard() {
  const t = await getTranslations('Dashboard');
  try {
    // Protected pages should fail closed before any data is fetched.
    // The wrapper reads the session cookie and returns null if the user is not
    // authenticated, which prevents an unnecessary round-trip to Rails.
    const lists = await api.auth.get<List[]>(`/api/v1/me/lists?limit=${DASHBOARD_LIST_LIMIT}`, {
      cache: 'no-store',
    });

    if (!lists) {
      redirect('/signin');
    }

    return (
      <Page>
      <PageHeader title={t('title')} caption={t('caption')} />
      <Section>
        <SectionHeader title={t('myLists')}>
          <MetaGroup>
            <Meta>{t('defaultCollection')}</Meta>
            <Meta>{t('onlyPublicVisible')}</Meta>
          </MetaGroup>
        </SectionHeader>
          <CollectionList>
            {lists.length > 0 ? (
              lists.map((list) => (
                <ListCard
                  list={list}
                  key={list.id}
                  isAuthor={true}
                />
              ))
            ) : (
              <p>{t('emptyLists')}</p>
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
