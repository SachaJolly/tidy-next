import React from 'react';

import Icon from '@/components/Icon/Icon';
import styles from './Banner.module.scss';

type BannerVariant = 'warning' | 'danger' | 'announcement';

interface BannerProps {
  children: React.ReactNode;
  title?: string;
  variant?: BannerVariant;
  className?: string;
}

const VARIANT_ICON: Record<BannerVariant, 'warning' | 'error' | 'info'> = {
  warning: 'warning',
  danger: 'error',
  announcement: 'info',
};

export default function Banner({
  children,
  title,
  variant = 'warning',
  className,
}: BannerProps) {
  const classes = [styles.banner, styles[variant], className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
      <span className={styles.icon} aria-hidden>
        <Icon name={VARIANT_ICON[variant]} size={16} />
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
