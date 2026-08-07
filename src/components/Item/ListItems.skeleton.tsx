import React from 'react';

import { ItemSkeleton } from './Item.skeleton';

export function ListItemsSkeleton() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <ItemSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
