import React from 'react';
import { FeedPageSkeleton } from '@/app/components/loading-skeletons';

export default function Loading() {
  return <FeedPageSkeleton sections={1} showHero={false} />;
}
