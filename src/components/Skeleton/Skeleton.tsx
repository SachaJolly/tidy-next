import React from 'react';

import Spinner from '@/components/Spinner/Spinner';

type SkeletonProps = {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  loading?: boolean;
  spinnerSize?: 12 | 16 | 20 | 24;
  spinnerLabel?: string;
};

export default function Skeleton({
  width = '100%',
  height = '1rem',
  className,
  style,
  children,
  loading = false,
  spinnerSize = 16,
  spinnerLabel = 'Loading',
}: SkeletonProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      role="presentation"
      aria-busy={loading || undefined}
      style={{
        width,
        height,
        borderRadius: '0.75rem',
        backgroundColor: 'var(--background-highlight)',
        display: loading ? 'inline-flex' : undefined,
        alignItems: loading ? 'center' : undefined,
        justifyContent: loading ? 'center' : undefined,
        ...style,
      }}
    >
      {loading ? <Spinner hidden={true} size={spinnerSize} label={spinnerLabel} /> : children}
    </div>
  );
}
