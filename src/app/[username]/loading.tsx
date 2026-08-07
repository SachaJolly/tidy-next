import React from 'react';
import PageLayout from '@/layouts/PageLayout';
import { ProfileHeaderSkeleton } from '@/components/ProfileCard/ProfileHeader.skeleton';
import { ProfileListsSkeleton } from '@/components/ProfileCard/ProfileLists.skeleton';

export default function Loading() {
  return (
    <PageLayout>
      <ProfileHeaderSkeleton />
      <ProfileListsSkeleton />
    </PageLayout>
  );
}
