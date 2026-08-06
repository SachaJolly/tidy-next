import React from 'react';

function SkeletonBlock({ width, height }: { width: string; height: string }) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        width,
        height,
        borderRadius: '0.5rem',
        backgroundColor: 'var(--background-highlight)',
      }}
    />
  );
}

export default function ItemBodySkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--background-background)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-interactive)',
        padding: '0.75rem 1rem',
      }}
    >
      <SkeletonBlock width="1rem" height="1rem" />
      <SkeletonBlock width="65%" height="1.125rem" />
    </div>
  );
}
