'use client';

import React from 'react';

import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import { MetaGroupContext } from '@/components/MetaGroup/MetaGroup';
import styles from './Meta.module.scss';

type MetaType =
  | 'muted'
  | 'featured'
  | 'popular'
  | 'trending'
  | 'visibility'
  | 'pinned'
  | 'shared'
  | 'tag'
  | 'handle';
type MetaSize = 'small' | 'base';

interface MetaProps {
  type?: MetaType;
  size?: MetaSize;
  /** Icon name from the central icon registry (`src/assets/icons`). */
  icon?: IconName;
  className?: string;
  /** Short text label — shorthand for wrapping a single string in children. */
  label?: string;
  children?: React.ReactNode;
}

const Meta: React.FC<MetaProps> = ({ type, size = 'small', icon, className, label, children }) => {
  const insideMetaGroup = React.useContext(MetaGroupContext);

  // Fail fast in development so misuse is caught immediately during testing.
  // The check is stripped in production builds (process.env.NODE_ENV).
  if (process.env.NODE_ENV !== 'production' && !insideMetaGroup) {
    throw new Error('<Meta> must be rendered inside a <MetaGroup>.');
  }

  const classes = [styles.meta, styles[size], type && styles[type], className]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      {icon && <Icon name={icon} size={16} />}
      {label ?? children}
    </li>
  );
};

export default Meta;
