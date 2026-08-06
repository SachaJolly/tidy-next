import React, { Suspense, use } from 'react';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';
import ListLayout from '@/layouts/ListLayout';
import {
  ListHeaderSection,
  ListItemsSection,
  ListModalsSection,
  getListPageData,
  ListHeaderSkeleton,
  ListItemsSkeleton,
} from './ListContent';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const list = await api.get<List>(`/api/v1/lists/${id}`);

    if (!list) return { title: 'List not found' };
    return { title: list.title };
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 404) {
      return { title: 'List not found' };
    }
    throw error;
  }
}

async function ListPageContent({ id }: { id: string }) {
  // Fetch all data once at the page level
  const { list, currentUser, locale, timezone, t, common, date } = await getListPageData(id);

  const author = list.author!;
  const items = list.items || [];
  const isAuthor = currentUser?.id === author.id;

  return (
    <>
      <Suspense fallback={<ListHeaderSkeleton />}>
        <ListHeaderSection
          list={list}
          author={author}
          locale={locale}
          timezone={timezone}
          isAuthor={isAuthor}
          t={t}
          common={common}
          date={date}
        />
      </Suspense>
      <Suspense fallback={<ListItemsSkeleton />}>
        <ListItemsSection items={items} listId={id} isAuthor={isAuthor} common={common} />
      </Suspense>
      <Suspense fallback={null}>
        <ListModalsSection listId={id} items={items} isAuthor={isAuthor} />
      </Suspense>
    </>
  );
}

export default function ListPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ListLayout>
      <ListPageContent id={id} />
    </ListLayout>
  );
}
