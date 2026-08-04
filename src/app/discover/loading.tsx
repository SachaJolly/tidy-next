import React from 'react';
import { FeedPageSkeleton } from '@/components/LoadingSkeletons';

export default function Loading() {
  return <FeedPageSkeleton sections={2} showHero={false} />;
}
