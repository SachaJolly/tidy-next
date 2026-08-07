import React from 'react';
import Skeleton from '@/components/Skeleton/Skeleton';

export function ItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0',
      }}
    >
      {/* Content card (link/bookmark style) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--background-background)',
          border: '1px solid var(--border-default)',
        }}
      >
        <Skeleton width="1rem" height="1rem" style={{ borderRadius: '0.25rem' }} />
        <Skeleton width="60%" height="1.25rem" style={{ borderRadius: '0.5rem' }} />
      </div>

      {/* Caption */}
      <Skeleton
        width="80%"
        height="0.875rem"
        style={{ margin: '0 0.5rem 0.5rem', borderRadius: '0.5rem' }}
      />

      {/* Stats (views, likes, comments) */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0 0.5rem',
        }}
      >
        <Skeleton width="5rem" height="0.75rem" style={{ borderRadius: '0.5rem' }} />
        <Skeleton width="5rem" height="0.75rem" style={{ borderRadius: '0.5rem' }} />
        <Skeleton width="5rem" height="0.75rem" style={{ borderRadius: '0.5rem' }} />
      </div>
    </div>
  );
}
