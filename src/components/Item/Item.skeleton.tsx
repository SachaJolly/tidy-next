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

export function ItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0',
      }}
    >
      {/* Content card (link/bookmark style) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--background-background)',
          border: '1px solid var(--border-default)',
        }}
      >
        <SkeletonBlock width="1rem" height="1rem" radius="0.25rem" />
        <SkeletonBlock width="60%" height="1.25rem" radius="0.5rem" />
      </div>

      {/* Caption */}
      <SkeletonBlock width="80%" height="0.875rem" radius="0.5rem" margin="0 0.5rem 0.5rem" />

      {/* Stats (views, likes, comments) */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0 0.5rem',
        }}
      >
        <SkeletonBlock width="5rem" height="0.75rem" radius="0.5rem" />
        <SkeletonBlock width="5rem" height="0.75rem" radius="0.5rem" />
        <SkeletonBlock width="5rem" height="0.75rem" radius="0.5rem" />
      </div>
    </div>
  );
}
