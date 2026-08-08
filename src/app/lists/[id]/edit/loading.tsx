import React from 'react';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

/**
 * The edit route renders a modal over the list, so its fallback mimics a single content
 * section rather than the full list page — the hero belongs to the page underneath.
 */
export default function Loading() {
  return <FeedPageSkeleton sections={1} showHero={false} />;
}
