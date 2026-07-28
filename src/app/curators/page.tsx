import React from 'react';
import Page from '@/app/layouts/page';
import PageHeader from '@/components/page-header/page-header';
import Section from '@/components/section/section';
import Hero from '@/components/hero/hero';
import CuratorMeta from '@/components/curator-meta/curator-meta';
import ListCard from '@/components/list-card/list-card';

import { getAuthStatus } from '@/lib/auth';
import { getActiveUsersWithRecentPublicLists } from '@/app/api/lists/route';
import type { List } from '@/lib/types';

const Curators = async () => {
  const isAuthenticated = await getAuthStatus();
  const curators = getActiveUsersWithRecentPublicLists();

  return (
    <>
      {!isAuthenticated && <Hero variant="horizontal" />}
      <Page>
        <PageHeader
          title="Curators"
          caption="Discover the people behind the best lists on TidyCards."
        />
        <Section>
          {curators.map(({ user, recentLists }) => {
            // Map the route List type to the shared @/lib/types List type expected by ListCard.
            const lists: List[] = recentLists.map((l) => ({
              id: l.id,
              title: l.title,
              description: l.description ?? null,
              status: l.status === 'DELETED' ? 'ARCHIVED' : l.status,
              visibility: l.visibility,
              color: l.color,
              thumbnail: l.thumbnail ?? null,
              displayMode: l.displayMode,
              itemsCount: l.items,
              collaboratorsCount: l.collaborators,
              notesCount: l.notes,
              isPinned: l.isPinned,
              isFeatured: l.isFeatured,
              isTrending: l.isTrending,
              isPopular: l.isPopular,
              createdAt: l.createdAt,
              updatedAt: l.updatedAt,
              deleted_at: l.deletedAt,
            }));

            return (
              <CuratorMeta
                key={user.id}
                profile={{
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  bio: user.bio,
                  email: user.email,
                  createdAt: user.createdAt,
                }}
                listsCount={user.stats.listsCount}
              >
                {lists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </CuratorMeta>
            );
          })}
        </Section>
      </Page>
    </>
  );
};

export default Curators;
