import React from 'react';
import Link from 'next/link';

import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import styles from './Notice.module.scss';

type NoticeVariant = 'information' | 'warning' | 'error' | 'success' | 'discovery';

type NoticeAction = {
  label: string;
  href: string;
};

interface NoticeProps {
  variant?: NoticeVariant;
  title?: string;
  description?: string;
  actions?: NoticeAction[];
  className?: string;
}

const VARIANT_ICON: Record<NoticeVariant, IconName> = {
  information: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
  discovery: 'search',
};

export default function Notice({
  variant = 'information',
  title,
  description,
  actions,
  className,
}: NoticeProps) {
  const classes = [styles.message, styles[variant], className].filter(Boolean).join(' ');
  const hasActions = Array.isArray(actions) && actions.length > 0;

  return (
    <div className={classes} role="status">
      <span className={styles.icon} aria-hidden>
        <Icon name={VARIANT_ICON[variant]} size={20} />
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {hasActions && (
          <div className={styles.actions}>
            {actions.map((action) => (
              <Link key={`${action.href}:${action.label}`} href={action.href} className={styles.link}>
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
