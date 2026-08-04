'use client';

import React, { useContext } from 'react';
import { DropdownSubContext, useDropdownContext } from './context';
import styles from './dropdown.module.scss';
import Icon from '../icon/icon';
import type { IconName } from '../icon/icons';

export interface DropdownSubTriggerProps {
  children: React.ReactNode;
  icon?: IconName;
  /** Header title shown in the back-navigation bar when this sub-menu is active. */
  title: string;
}

export function DropdownSubTrigger({ children, icon, title }: DropdownSubTriggerProps) {
  const subCtx = useContext(DropdownSubContext);
  const { currentView, navigateTo } = useDropdownContext();

  // Sub triggers only appear in the root view — they are part of the parent
  // menu's item list, not the sub-menu's content.
  if (currentView !== 'root') return null;
  if (!subCtx) throw new Error('<DropdownSubTrigger> must be inside <DropdownSub>');

  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      className={styles.item}
      // Clicking navigates INTO the sub-menu (drill-down, not fly-out).
      // The title is stored in the view stack and shown in the back-button header.
      onClick={() => navigateTo(subCtx.id, title)}
    >
      {icon && <Icon name={icon} size={16} className={styles.itemIcon} />}
      <span>{children}</span>
      <span className={styles.subArrow}>
        <Icon name="arrow_right" size={16} />
      </span>
    </button>
  );
}
