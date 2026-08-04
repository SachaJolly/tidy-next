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
        backgroundColor: 'var(--surface-highlight)',
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
        padding: '1rem',
        borderRadius: '1rem',
        backgroundColor: 'var(--surface-modal)',
      }}
    >
      <SkeletonBlock width="16rem" height="8rem" radius="0.85rem" />
      <SkeletonBlock width="70%" height="1rem" />
      <SkeletonBlock width="55%" height="1rem" />
    </div>
  );
}
