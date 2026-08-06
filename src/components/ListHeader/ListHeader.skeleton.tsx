import React from 'react';

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
