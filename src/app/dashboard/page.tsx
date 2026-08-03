import React, { Suspense } from 'react';
import DashboardContent from './dashboard-content';
import { FeedPageSkeleton } from '@/app/components/loading-skeletons';

export default function DashboardPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={false} />}>
      <DashboardContent />
    </Suspense>
  );
}
