import React from 'react';

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
  className?: string;
  /** Short text label — shorthand for wrapping a single string in children. */
  label?: string;
  children?: React.ReactNode;
}

const Meta: React.FC<MetaProps> = ({ type, size = 'small', className, label, children }) => {
  const insideMetaGroup = React.useContext(MetaGroupContext);

  // Fail fast in development so misuse is caught immediately during testing.
  // The check is stripped in production builds (process.env.NODE_ENV).
  if (process.env.NODE_ENV !== 'production' && !insideMetaGroup) {
    throw new Error('<Meta> must be rendered inside a <MetaGroup>.');
  }

  const classes = [styles.meta, styles[size], type && styles[type], className]
    .filter(Boolean)
    .join(' ');

  return <li className={classes}>{label ?? children}</li>;
};

export default Meta;
