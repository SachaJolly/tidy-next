import React, { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

export default function DashboardPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={false} />}>
      <DashboardContent />
    </Suspense>
  );
}
