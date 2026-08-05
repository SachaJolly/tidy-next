'use client';

import React from 'react';

import Icon from '@/components/Icon/Icon';
import styles from './ButtonHover.module.scss';

export interface ButtonHoverProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional label displayed to the left of the trigger button. */
  label?: string;
  /** Extra class applied to the outer container. */
  containerClassName?: string;
}

/**
 * ButtonHover renders an optional label alongside a <button> trigger.
 *
 * The component spreads all HTMLButtonElement props (onClick, aria-expanded,
 * aria-haspopup, etc.) onto the inner <button> so it can be used directly as
 * a DropdownTrigger asChild target — the Dropdown compound component will
 * clone this element and inject the required event/ARIA props.
 */
export function ButtonHover({ label, containerClassName, className, ...buttonProps }: ButtonHoverProps) {
  return (
    <div className={[styles.container, containerClassName].filter(Boolean).join(' ')}>
      {label && <div className={styles.label}>{label}</div>}

      {/* Inner <button> receives all forwarded props (onClick, aria-*, etc.) */}
      <button type="button" className={[styles.trigger, className].filter(Boolean).join(' ')} {...buttonProps}>
        <Icon name="drag" size={20} />
      </button>
    </div>
  );
}

export default ButtonHover;
