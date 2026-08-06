'use client';

import React from 'react';

import Icon from '@/components/Icon/Icon';
import { type IconName } from '@/components/Icon/icons';
import styles from './Modal.module.scss';
import { ModalContext } from './ModalContext';

type IconVariant = 'default' | 'warning' | 'danger';

const ICON_COLORS: Record<IconVariant, string> = {
  default: 'var(--text-heading)',
  warning: 'var(--text-warning)',
  danger: 'var(--text-danger)',
};

export function ModalHeader({
  title,
  icon,
  iconVariant = 'default',
  children,
  className,
}: {
  title?: string;
  icon?: IconName;
  iconVariant?: IconVariant;
  children?: React.ReactNode;
  className?: string;
}) {
  const { titleId } = React.useContext(ModalContext);

  return (
    <div id={titleId} className={[styles.header, className].filter(Boolean).join(' ')}>
      {icon && (
        <span className={styles.headerIcon} style={{ color: ICON_COLORS[iconVariant] }}>
          <Icon name={icon} />
        </span>
      )}
      <div className={styles.headerText}>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
