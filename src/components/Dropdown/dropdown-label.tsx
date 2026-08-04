'use client';

import React, { useContext } from 'react';
import { SubContentActiveContext, useDropdownContext } from './context';
import styles from './dropdown.module.scss';

export interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  // Items/labels/separators at root level must hide themselves when a sub-view
  // is active; those inside an active SubContent always render.
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  return <div className={[styles.label, className].filter(Boolean).join(' ')}>{children}</div>;
}
