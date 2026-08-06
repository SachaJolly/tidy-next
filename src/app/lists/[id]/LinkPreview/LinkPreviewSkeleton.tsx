'use client';

import React from 'react';

import ItemLinkSkeleton from '@/components/ItemLink/ItemLink.skeleton';

import styles from './LinkPreview.module.scss';

type LinkPreviewSkeletonProps = {
  displayMode: 'link' | 'bookmark' | 'embed';
  wrapped?: boolean;
};

function SkeletonBlock({
  width,
  height,
  className,
}: {
  width: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={[styles.skeletonBlock, className].filter(Boolean).join(' ')}
      style={{ width, ...(height ? { height } : {}) }}
      aria-hidden={true}
    />
  );
}

function BookmarkSkeleton() {
  return <SkeletonBlock width="100%" height="10rem" />;
}

function EmbedSkeleton() {
  return (
    <div className={styles.skeletonEmbed} aria-hidden={true}>
      <SkeletonBlock width="100%" className={styles.skeletonEmbedRatio} />
      <div className={styles.skeletonEmbedMedia} />
    </div>
  );
}

export default function LinkPreviewSkeleton({
  displayMode,
  wrapped = true,
}: LinkPreviewSkeletonProps) {
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
