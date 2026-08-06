import React from 'react';

type SkeletonBlockProps = {
  width?: string;
  height?: string;
  radius?: string;
  margin?: string;
};

function SkeletonBlock({
  width = '100%',
  height = '1rem',
  radius = '0.75rem',
  margin = '0',
}: SkeletonBlockProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        width,
        height,
        borderRadius: radius,
        margin,
        backgroundColor: 'var(--background-highlight)',
      }}
    />
  );
}

export default function ListCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '.5rem .5rem .75rem',
        borderRadius: '1rem',
        backgroundColor: 'var(--background-modal)',
      }}
    >
      <SkeletonBlock width="16rem" height="8rem" radius="0.25rem" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', }} >
        <SkeletonBlock width="70%" height="1.25rem" margin=".125rem 0" />
        <SkeletonBlock width="4rem" height=".75rem" margin=".125rem 0" />
      </div>
    </div>
  );
}
