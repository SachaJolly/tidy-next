import React from 'react';
import { ListPageSkeleton } from '@/layouts/ListLayout/ListPage.skeleton';

/**
 * Shown while the page component awaits its data on a cold navigation.
 *
 * The page also wraps each section in its own Suspense boundary, which takes over for
 * client-side navigations; this file covers the initial request, before any of them exist.
 */
export default function Loading() {
  return <ListPageSkeleton />;
}
