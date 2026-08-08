'use client';

import React from 'react';

import Skeleton from '@/components/Skeleton/Skeleton';

import styles from './ItemLink.module.scss';

type ItemLinkSkeletonProps = {
  displayMode: 'link' | 'bookmark' | 'embed';
};

function LinkSkeleton() {
  return (
    <div className={[styles.content, `non-interactive`].join(' ')} aria-hidden="true">
      <Skeleton width="1rem" height="1rem" style={{ borderRadius: 'var(--radius-sm)' }} />
      <Skeleton width="55%" height="1rem" style={{ margin: '.125rem 0', borderRadius: 'var(--radius-full)' }} />

    </div>
  );
}

function BookmarkSkeleton() {
  return (
    <div
      className={[styles.content, styles.bookmark, 'non-interactive'].join(' ')}
      aria-hidden="true"
    >
      <div className={styles.info}>
        <div className={styles['info-meta']}>
          <Skeleton
            width="45%"
            height="1.125rem"
            style={{ margin: '.1875rem 0', borderRadius: 'var(--radius-full)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <Skeleton
              width="90%"
              height="0.75rem"
              style={{ margin: '.25rem 0', borderRadius: 'var(--radius-full)' }}
            />
            <Skeleton
              width="42%"
              height="0.75rem"
              style={{ margin: '.25rem 0', borderRadius: 'var(--radius-full)' }}
            />
          </div>
        </div>
        <div className={styles['site']}>
          <Skeleton width="1rem" height="1rem" style={{ borderRadius: 'var(--radius-sm)' }} />
          <Skeleton width="25%" height=".75rem" style={{ borderRadius: 'var(--radius-full)', margin: '.125rem 0' }} />
        </div>
      </div>
      <Skeleton width="min(100%, 14rem)" height="8rem" style={{ borderRadius: 'var(--radius-sm)' }} />
    </div>
  );
}

function EmbedSkeleton() {
  return (
    <div className={[styles.content, styles.embed, 'non-interactive'].join(' ')} aria-hidden="true">
      <div className={styles['info-meta']}>
        <Skeleton
          width="35%"
          height="1.125rem"
          style={{ margin: '.0625rem 0', borderRadius: '0.5rem' }}
        />
        <Skeleton
          width="67%"
          height="0.75rem"
          style={{ margin: '.25rem 0', borderRadius: '0.5rem' }}
        />
      </div>
      <Skeleton className={styles['embed-content']} style={{ borderRadius: 'var(--radius-sm)' }} width="100%" height="auto" />
      <div className={styles['site']}>
        <Skeleton width="1rem" height="1rem" style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton width="25%" height=".75rem" style={{ borderRadius: '0.5rem', margin: '.125rem 0' }} />
      </div>
    </div>
  );
}

export default function ItemLinkSkeleton({ displayMode }: ItemLinkSkeletonProps) {
  return (
    <>
      {displayMode === 'link' ? <LinkSkeleton /> : null}
      {displayMode === 'bookmark' ? <BookmarkSkeleton /> : null}
      {displayMode === 'embed' ? <EmbedSkeleton /> : null}
    </>
  );
}
