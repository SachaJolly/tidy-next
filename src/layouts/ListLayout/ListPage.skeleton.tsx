import React from 'react';

import { ListItemsSkeleton } from '@/components/Item/ListItems.skeleton';
import { ListHeaderSkeleton } from '@/components/ListHeader/ListHeader.skeleton';

import ListLayout from './ListLayout';

export function ListPageSkeleton() {
  return (
    <ListLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ListHeaderSkeleton />
        <ListItemsSkeleton />
      </div>
    </ListLayout>
  );
}
