"use client";

import React, { useCallback } from 'react';
import { useDropdownContext } from './context';
import styles from './dropdown.module.scss';

export interface DropdownTriggerProps {
  children: React.ReactNode;
  /**
   * When true, the trigger renders no DOM wrapper.
   * React.cloneElement injects ref, onClick, and ARIA attributes directly into
   * the single child element — ideal for custom-styled buttons or icon buttons.
   * The child must be a DOM element or a component that uses React.forwardRef.
   */
  asChild?: boolean;
}

export function DropdownTrigger({ children, asChild = false, ...rest }: DropdownTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);
  const restOnClick = rest.onClick as ((e: React.MouseEvent) => void) | undefined;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        toggle();
        restOnClick?.(e);
        (children as React.ReactElement<any>).props.onClick?.(e);
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      ...rest,
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={(e) => {
        toggle();
        restOnClick?.(e);
      }}
      aria-expanded={open}
      aria-haspopup="menu"
      {...rest}
      className={styles.trigger}
    >
      {children}
    </button>
  );
}
