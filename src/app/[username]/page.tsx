import React, { Suspense, use } from 'react';
import Page from '@/app/layouts/page';
import { ProfileHeaderSection, ProfileListsSection } from './profile-content';
import { ProfileHeaderSkeleton, ProfileListsSkeleton } from '@/app/components/loading-skeletons';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function UserPage({ params }: UserPageProps) {
  const { username } = use(params);

  return (
    <Page>
      <Suspense fallback={<ProfileHeaderSkeleton />}>
        <ProfileHeaderSection username={username} />
      </Suspense>
      <Suspense fallback={<ProfileListsSkeleton />}>
        <ProfileListsSection username={username} />
      </Suspense>
    </Page>
  );
}
