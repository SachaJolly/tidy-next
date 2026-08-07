import React from 'react';
import Skeleton from '@/components/Skeleton/Skeleton';

type ItemLinkSkeletonProps = {
  loading?: boolean;
  spinnerSize?: 12 | 16 | 20 | 24;
  className?: string;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
};

export default function ItemLinkSkeleton({
  loading = false,
  spinnerSize = 16,
  className,
  style,
  lineStyle,
}: ItemLinkSkeletonProps) {
  return (
    <Skeleton
      className={className}
      loading={loading}
      spinnerSize={spinnerSize}
      spinnerLabel="Loading link preview"
      style={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--background-background)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-interactive)',
        padding: '0.75rem 1rem',
        ...style,
      }}
    >
      {!loading && (
        <>
          <Skeleton width="1rem" height="1rem" style={{ borderRadius: '0.5rem', ...lineStyle }} />
          <Skeleton
            width="55%"
            height="1.125rem"
            style={{ borderRadius: '0.5rem', ...lineStyle }}
          />
        </>
      )}
    </Skeleton>
  );
}
