'use client';

import React, { useContext } from 'react';
import { SubContentActiveContext, useDropdownContext } from './context';
import styles from './Dropdown.module.scss';

export function DropdownSeparator() {
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  return <hr className={styles.separator} />;
}
