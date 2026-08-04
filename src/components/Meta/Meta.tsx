import React from 'react';
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
  children: React.ReactNode;
}

const Meta: React.FC<MetaProps> = ({ type, size = 'small', className, children }) => {
  const classes = [styles.meta, styles[size], type && styles[type], className]
    .filter(Boolean)
    .join(' ');

  return <li className={classes}>{children}</li>;
};

export default Meta;
