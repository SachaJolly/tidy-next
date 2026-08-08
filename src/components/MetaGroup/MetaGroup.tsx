import React from 'react';

import styles from './MetaGroup.module.scss';

/**
 * Context used purely as a presence guard — Meta reads it to verify
 * it was rendered inside a MetaGroup. No value is passed, only existence.
 */
export const MetaGroupContext = React.createContext(false);

interface MetaGroupProps {
  children: React.ReactNode;
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
}

const MetaGroup: React.FC<MetaGroupProps> = ({ children, orientation = 'horizontal' }) => (
  <MetaGroupContext.Provider value={true}>
    <div className={[styles.group, styles[orientation]].join(' ')}>{children}</div>
  </MetaGroupContext.Provider>
);

export default MetaGroup;
