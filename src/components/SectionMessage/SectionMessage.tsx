import React from 'react';
import Link from 'next/link';

import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import styles from './SectionMessage.module.scss';

type SectionMessageVariant = 'information' | 'warning' | 'error' | 'success' | 'discovery';

type SectionMessageAction = {
  label: string;
  href: string;
};

interface SectionMessageProps {
  variant?: SectionMessageVariant;
  title?: string;
  description?: string;
  actions?: SectionMessageAction[];
  className?: string;
}

const VARIANT_ICON: Record<SectionMessageVariant, IconName> = {
  information: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
  discovery: 'search',
};

export default function SectionMessage({
  variant = 'information',
  title,
  description,
  actions,
  className,
}: SectionMessageProps) {
  const classes = [styles.message, styles[variant], className].filter(Boolean).join(' ');
  const hasActions = Array.isArray(actions) && actions.length > 0;

  return (
    <div className={classes} role="status">
      <span className={styles.icon} aria-hidden>
        <Icon name={VARIANT_ICON[variant]} size={16} />
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
