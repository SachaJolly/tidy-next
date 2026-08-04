"use client";

import React, { useContext } from 'react';
import { SubContentActiveContext, useDropdownContext } from './context';
import styles from './dropdown.module.scss';

export interface DropdownTextProps {
  children: React.ReactNode;
  className?: string;
}

/** Non-interactive muted text block — use for footers, version strings, hints. */
export function DropdownText({ children, className }: DropdownTextProps) {
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  return (
    <div className={[styles.text, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
