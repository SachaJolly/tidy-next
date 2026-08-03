import React, { Suspense, use } from 'react';
import { api, ApiFetchError } from '@/lib/api';
import type { List } from '@/lib/types';
import ListLayout from '@/app/layouts/list-layout';
import {
  ListHeaderSection,
  ListItemsSection,
} from './list-content';
import { ListHeaderSkeleton, ListItemsSkeleton } from '@/app/components/loading-skeletons';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Suspense fallback={<ListHeaderSkeleton />}>
          <ListHeaderSection id={id} />
        </Suspense>
        <Suspense fallback={<ListItemsSkeleton />}>
          <ListItemsSection id={id} />
        </Suspense>
      </div>
    </ListLayout>
  );
}
