import React from 'react';
import Skeleton from '@/components/Skeleton/Skeleton';

export default function ItemBodySkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--background-background)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-interactive)',
        padding: '0.75rem 1rem',
      }}
    >
      <Skeleton width="1rem" height="1rem" style={{ borderRadius: '0.5rem' }} />
      <Skeleton width="65%" height="1.125rem" style={{ borderRadius: '0.5rem' }} />
    </div>
  );
}
