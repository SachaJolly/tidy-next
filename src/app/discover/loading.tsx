import React from 'react';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

export default function Loading() {
  return <FeedPageSkeleton sections={2} showHero={false} />;
}
