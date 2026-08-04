import React, { Suspense, use } from 'react';
import PageLayout from '@/layouts/PageLayout';
import { ProfileHeaderSection, ProfileListsSection } from './profile-content';
import { ProfileHeaderSkeleton, ProfileListsSkeleton } from '@/components/loading-skeletons';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserPage({ params }: UserPageProps) {
  const { username } = use(params);

  return (
    <PageLayout>
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderSection username={username} />
      </Suspense>
      <Suspense fallback={<ProfileListsSkeleton />}>
        <ProfileListsSection username={username} />
      </Suspense>
    </PageLayout>
  );
}
