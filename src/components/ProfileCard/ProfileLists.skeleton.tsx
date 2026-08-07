import React from 'react';

import ListCardSkeleton from '@/components/ListCard/ListCard.skeleton';
import Skeleton from '@/components/Skeleton/Skeleton';

export function ProfileListsSkeleton() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton width="10rem" height="1.5rem" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
