import React from 'react';
import PageLayout from '@/layouts/PageLayout';
import { ProfileHeaderSkeleton, ProfileListsSkeleton } from '@/components/LoadingSkeletons';

export default function Loading() {
  return (
    <PageLayout>
      <ProfileHeaderSkeleton />
      <ProfileListsSkeleton />
    </PageLayout>
  );
}
