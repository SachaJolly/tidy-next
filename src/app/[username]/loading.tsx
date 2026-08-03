import React from 'react';
import Page from '@/app/layouts/page';
import { ProfileHeaderSkeleton, ProfileListsSkeleton } from '@/app/components/loading-skeletons';

export default function Loading() {
  return (
    <Page>
      <ProfileHeaderSkeleton />
      <ProfileListsSkeleton />
    </Page>
  );
}
