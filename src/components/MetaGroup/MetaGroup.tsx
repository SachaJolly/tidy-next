import React from 'react';

import styles from './MetaGroup.module.scss';

interface MetaGroupProps {
  children: React.ReactNode;
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
}

const MetaGroup: React.FC<MetaGroupProps> = ({ children, orientation = 'horizontal' }) => (
  <div className={[styles.group, styles[orientation]].join(' ')}>{children}</div>
);

export default MetaGroup;
