import React from 'react';

import ListCardSkeleton from '@/components/ListCard/ListCard.skeleton';
import Skeleton from '@/components/Skeleton/Skeleton';

import PageLayout from './PageLayout';

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
            <Skeleton width="100%" height="12rem" style={{ borderRadius: '1.5rem' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton width="10rem" height="2.5rem" />
          <Skeleton width="18rem" height="1.25rem" />
        </div>

        {Array.from({ length: sections }).map((_, index) => (
          <section key={index} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton width="8rem" height="1.5rem" />
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
