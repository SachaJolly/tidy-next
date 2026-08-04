'use client';

import React, { useContext } from 'react';
import { SubContentActiveContext, useDropdownContext } from './context';
import styles from './dropdown.module.scss';
import Icon from '@/components/icon/icon';
import type { IconName } from '@/components/icon/icons';

export interface DropdownItemProps {
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
  href?: string;
  /** Anchor target. When `"_blank"`, an external-link icon is appended automatically. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /** Anchor rel attribute. Defaults to `"noopener noreferrer"` when `target="_blank"`. */
  rel?: string;
  /**
   * Fired when the item is activated (click or Enter).
   * Calling `event.preventDefault()` inside this handler prevents the dropdown
   * from auto-closing — use this to open a confirmation dialog or a nested
   * modal while keeping the dropdown mounted in the background.
   */
  onSelect?: (event: Event) => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}

export function DropdownItem({
  children,
  label,
  caption,
  prefix,
  icon,
  href,
  target,
  rel,
  onSelect,
  disabled,
  destructive,
  className,
}: DropdownItemProps) {
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView, close } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  const handleActivate = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onSelect) {
      // A cancelable DOM Event mirrors the pattern used by Radix UI and WAI-ARIA
      // best practices. Consumers call event.preventDefault() to opt out of the
      // default auto-close, e.g. to open a confirmation dialog first.
      const selectEvent = new Event('select', { cancelable: true });
      onSelect(selectEvent);
      if (selectEvent.defaultPrevented) return;
    }

    close();
  };

  // Leading slot: custom prefix node takes precedence over named icon.
  const leading =
    prefix ?? (icon ? <Icon name={icon} size={16} className={styles.itemIcon} /> : null);

  // Trailing slot: show an external-link indicator when the link opens in a new tab.
  const isBlank = target === '_blank';
  const trailing = isBlank ? <Icon name="open" size={16} className={styles.itemTrailing} /> : null;

  const resolvedRel = rel ?? (isBlank ? 'noopener noreferrer' : undefined);

  const sharedProps = {
    role: 'menuitem' as const,
    className: [styles.item, className].filter(Boolean).join(' '),
    'data-destructive': destructive || undefined,
    'data-disabled': disabled || undefined,
    onClick: handleActivate,
  };

  if (href) {
    return (
      <a href={href} target={target} rel={resolvedRel} {...sharedProps}>
        {leading}
        <span className={styles.itemText}>
          <span>{label ?? children}</span>
          {caption && <span className={styles.itemCaption}>{caption}</span>}
        </span>
        {trailing}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} {...sharedProps}>
      {leading}
      <span className={styles.itemText}>
        <span>{label ?? children}</span>
        {caption && <span className={styles.itemCaption}>{caption}</span>}
      </span>
    </button>
  );
}
