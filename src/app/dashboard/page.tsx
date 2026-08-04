import React, { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { FeedPageSkeleton } from '@/components/LoadingSkeletons';

export default function DashboardPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={false} />}>
      <DashboardContent />
    </Suspense>
  );
}
