import React from 'react';
import Skeleton from '@/components/Skeleton/Skeleton';

export default function ListCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '.5rem .5rem .75rem',
        borderRadius: '1rem',
        backgroundColor: 'var(--background-modal)',
      }}
    >
      <Skeleton width="16rem" height="8rem" style={{ borderRadius: '0.25rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
        <Skeleton width="70%" height="1.25rem" style={{ margin: '.125rem 0' }} />
        <Skeleton width="4rem" height=".75rem" style={{ margin: '.125rem 0' }} />
      </div>
    </div>
  );
}
