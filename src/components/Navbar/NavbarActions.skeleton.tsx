import React from 'react';

import Skeleton from '@/components/Skeleton/Skeleton';

export function NavbarActionsSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
    >
      <Skeleton width="5.5rem" height="2.5rem" />
      <Skeleton width="5.5rem" height="2.5rem" />
      <Skeleton width="2.5rem" height="2.5rem" style={{ borderRadius: '999px' }} />
    </div>
  );
}
