import React from 'react';

import Skeleton from '@/components/Skeleton/Skeleton';

export function ProfileHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
      <Skeleton width="6rem" height="6rem" style={{ borderRadius: '999px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <Skeleton width="14rem" height="2rem" />
        <Skeleton width="8rem" height="1rem" />
        <Skeleton width="100%" height="4rem" />
      </div>
    </div>
  );
}

export default ProfileHeaderSkeleton;
