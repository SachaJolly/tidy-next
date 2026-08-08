'use client';

import React, { useContext } from 'react';
import { SubContentActiveContext, useDropdownContext } from './context';
import styles from './Dropdown.module.scss';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';

export interface DropdownItemProps {
  children?: React.ReactNode;
  label?: string;
  caption?: string;
  prefix?: React.ReactNode;
  icon?: IconName;
  href?: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: string;
  onSelect?: (event: Event) => void;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  destructive?: boolean;
  isHighlighted?: boolean;
  className?: string;
}

export const DropdownItem = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  DropdownItemProps
>(function DropdownItem(
  {
    children,
    label,
    caption,
    prefix,
    icon,
    href,
    target,
    rel,
    onSelect,
    onMouseDown,
    disabled,
    destructive,
    isHighlighted,
    className,
  },
  ref,
) {
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView, close } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  const handleActivate = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onSelect) {
      const selectEvent = new Event('select', { cancelable: true });
      onSelect(selectEvent);
      if (selectEvent.defaultPrevented) return;
    }
    close();
  };

  const leading =
    prefix ?? (icon ? <Icon name={icon} size={16} className={styles['item-icon']} /> : null);
  const isBlank = target === '_blank';
  const trailing = isBlank ? <Icon name="open" size={16} className={styles['item-trailing']} /> : null;
  const resolvedRel = rel ?? (isBlank ? 'noopener noreferrer' : undefined);

  const sharedProps = {
    ref,
    role: 'menuitem' as const,
    className: [styles.item, className].filter(Boolean).join(' '),
    'data-destructive': destructive || undefined,
    'data-disabled': disabled || undefined,
    'data-highlighted': isHighlighted || undefined,
    onClick: handleActivate,
    onMouseDown,
  };

  if (href) {
    return (
      <a href={href} target={target} rel={resolvedRel} {...sharedProps}>
        {leading}
        <span className={styles['item-text']}>
          <span>{label ?? children}</span>
          {caption && <span className={styles['item-caption']}>{caption}</span>}
        </span>
        {trailing}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled} {...sharedProps}>
      {leading}
      <span className={styles['item-text']}>
        <span>{label ?? children}</span>
        {caption && <span className={styles['item-caption']}>{caption}</span>}
      </span>
    </button>
  );
});
