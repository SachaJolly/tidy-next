import React from 'react';
import Skeleton from '@/components/Skeleton/Skeleton';

export function ListHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton width="16rem" height="2.5rem" />
        <Skeleton width="22rem" height="1rem" />
        <Skeleton width="18rem" height="1rem" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Skeleton width="7rem" height="2.25rem" />
        <Skeleton width="7rem" height="2.25rem" />
        <Skeleton width="7rem" height="2.25rem" />
      </div>
    </div>
  );
}
