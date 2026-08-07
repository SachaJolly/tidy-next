import React, { Suspense } from 'react';
import LatestContent from './LatestContent';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

export default function LatestPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={true} />}>
      <LatestContent />
    </Suspense>
  );
}
