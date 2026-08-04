"use client";

import React, { useContext } from 'react';
import { RadioGroupContext, SearchContext, useDropdownContext } from './context';
import styles from './dropdown.module.scss';
import Icon from '@/components/icon/icon';
import type { IconName } from '@/components/icon/icons';

export interface DropdownRadioItemProps {
  value: string;
  children?: React.ReactNode;
  /** Primary label text. Takes precedence over `children` when both are provided. */
  label?: string;
  /** Optional secondary line rendered below the label (e.g. "Anyone can see"). */
  caption?: string;
  /**
   * Custom node rendered in the leading icon slot (e.g. <Avatar>).
   * Takes precedence over `icon` when both are provided.
   */
  prefix?: React.ReactNode;
  icon?: IconName;
}

export function DropdownRadioItem({ value, children, label, caption, prefix, icon }: DropdownRadioItemProps) {
  const radioCtx = useContext(RadioGroupContext);
  const { close }  = useDropdownContext();
  const { query }  = useContext(SearchContext);

  // Resolve the display label: explicit `label` prop > string children > value fallback.
  // The resolved string is also used for search filtering.
  const displayLabel = label ?? (typeof children === 'string' ? children : undefined) ?? value;
  if (query && !displayLabel.toLowerCase().includes(query.toLowerCase())) return null;

  const checked = radioCtx?.value === value;

  const handleClick = () => {
    radioCtx?.onValueChange(value);
    if (radioCtx?.closeOnSelect) close();
  };

  // Leading slot: custom prefix node takes precedence over named icon.
  const leading = prefix ?? (icon ? <Icon name={icon} size={16} className={styles.itemIcon} /> : null);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-checked={checked || undefined}
      className={styles.item}
      onClick={handleClick}
    >
      {leading}
      <span className={styles.itemText}>
        <span>{label ?? children}</span>
        {caption && <span className={styles.itemCaption}>{caption}</span>}
      </span>
      {checked && (
        <span className={styles.checkmark}>
          <Icon name="check" size={16} />
        </span>
      )}
    </button>
  );
}
