import React from 'react';

import ListCardSkeleton from '@/components/ListCard/ListCardSkeleton';
import ListLayout from '@/layouts/ListLayout';
import PageLayout from '@/layouts/PageLayout';

type SkeletonBlockProps = {
  width?: string;
  height?: string;
  radius?: string;
};

function SkeletonBlock({
  width = '100%',
  height = '1rem',
  radius = '0.75rem',
}: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: 'var(--background-highlight)',
      }}
    />
  );
}

export function NavbarAuthFallback() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
    >
      <SkeletonBlock width="5.5rem" height="2.5rem" />
      <SkeletonBlock width="5.5rem" height="2.5rem" />
      <SkeletonBlock width="2.5rem" height="2.5rem" radius="999px" />
    </div>
  );
}

export function FeedPageSkeleton({
  sections = 1,
  showHero = false,
}: {
  sections?: number;
  showHero?: boolean;
}) {
  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {showHero && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SkeletonBlock width="100%" height="12rem" radius="1.5rem" />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SkeletonBlock width="10rem" height="2.5rem" />
          <SkeletonBlock width="18rem" height="1.25rem" />
        </div>

        {Array.from({ length: sections }).map((_, index) => (
          <section key={index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SkeletonBlock width="8rem" height="1.5rem" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
                gap: '1rem',
              }}
            >
              {Array.from({ length: 4 }).map((__, cardIndex) => (
                <ListCardSkeleton key={cardIndex} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageLayout>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
      <SkeletonBlock width="6rem" height="6rem" radius="999px" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <SkeletonBlock width="14rem" height="2rem" />
        <SkeletonBlock width="8rem" height="1rem" />
        <SkeletonBlock width="100%" height="4rem" />
      </div>
    </div>
  );
}

export function ProfileListsSkeleton() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SkeletonBlock width="10rem" height="1.5rem" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function ListHeaderSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SkeletonBlock width="16rem" height="2.5rem" />
        <SkeletonBlock width="22rem" height="1rem" />
        <SkeletonBlock width="18rem" height="1rem" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', flexWrap: 'wrap' }}>
        <SkeletonBlock width="7rem" height="2.25rem" />
        <SkeletonBlock width="7rem" height="2.25rem" />
        <SkeletonBlock width="7rem" height="2.25rem" />
      </div>
    </div>
  );
}

export function ListItemsSkeleton() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SkeletonBlock width="7rem" height="1.5rem" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <ListCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function ListPageSkeleton() {
  return (
    <ListLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <ListHeaderSkeleton />
        <ListItemsSkeleton />
      </div>
    </ListLayout>
  );
}
