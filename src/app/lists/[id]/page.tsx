import React, { Suspense, use } from 'react';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';
import ListLayout from '@/layouts/ListLayout';
import { ListHeaderSection, ListItemsSection, ListModalsSection } from './ListContent';
import { ListHeaderSkeleton, ListItemsSkeleton } from '@/components/LoadingSkeletons';

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

export default function ListPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ListLayout>
      <Suspense fallback={<ListHeaderSkeleton />}>
        <ListHeaderSection id={id} />
      </Suspense>
      <Suspense fallback={<ListItemsSkeleton />}>
        <ListItemsSection id={id} />
      </Suspense>
      <Suspense fallback={null}>
        <ListModalsSection id={id} />
      </Suspense>
    </ListLayout>
  );
}
