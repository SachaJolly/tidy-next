import React, { Suspense } from 'react';
import CuratorsContent from './CuratorsContent';
import { FeedPageSkeleton } from '@/components/LoadingSkeletons';

export default function CuratorsPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={true} />}>
      <CuratorsContent />
    </Suspense>
  );
}
