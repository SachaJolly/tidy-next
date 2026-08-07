'use client';

import React from 'react';

import ItemLinkSkeleton from '@/components/ItemLink/ItemLink.skeleton';
import Skeleton from '@/components/Skeleton/Skeleton';

import styles from './LinkPreview.module.scss';

type LinkPreviewSkeletonProps = {
  displayMode: 'link' | 'bookmark' | 'embed';
  wrapped?: boolean;
  loading?: boolean;
};

function BookmarkSkeleton() {
  return <Skeleton className={styles.skeletonBlock} width="100%" height="10rem" />;
}

function EmbedSkeleton() {
  return (
    <div className={styles.skeletonEmbed} aria-hidden={true}>
      <Skeleton
        className={[styles.skeletonBlock, styles.skeletonEmbedRatio].join(' ')}
        width="100%"
      />
      <div className={styles.skeletonEmbedMedia} />
    </div>
  );
}

export default function LinkPreviewSkeleton({
  displayMode,
  wrapped = true,
  loading = false,
}: LinkPreviewSkeletonProps) {
  if (loading) {
    const loadingBody = <ItemLinkSkeleton loading={true} />;

    if (!wrapped) {
      return <div aria-hidden={true}>{loadingBody}</div>;
    }

    return (
      <div className={styles.container} aria-hidden={true}>
        {loadingBody}
      </div>
    );
  }

  const body = (
    <>
      {displayMode === 'link' ? <ItemLinkSkeleton /> : null}
      {displayMode === 'bookmark' ? <BookmarkSkeleton /> : null}
      {displayMode === 'embed' ? <EmbedSkeleton /> : null}
    </>
  );

  if (!wrapped) {
    return <div aria-hidden={true}>{body}</div>;
  }

  return (
    <div className={styles.container} aria-hidden={true}>
      {body}
    </div>
  );
}
