import React, { Suspense } from 'react';
import CuratorsContent from './curators-content';
import { FeedPageSkeleton } from '@/components/loading-skeletons';

export default function CuratorsPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={true} />}>
      <CuratorsContent />
    </Suspense>
  );
}
