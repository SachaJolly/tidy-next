import React from 'react';
import PageLayout from '@/layouts/PageLayout';
import { ProfileHeaderSkeleton, ProfileListsSkeleton } from '@/components/loading-skeletons';

export default function Loading() {
  return (
    <PageLayout>
      <ProfileHeaderSkeleton />
      <ProfileListsSkeleton />
    </PageLayout>
  );
}
