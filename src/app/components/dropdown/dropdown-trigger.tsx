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

export function DropdownTrigger({ children, asChild = false }: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        toggle();
        (children as React.ReactElement<any>).props.onClick?.(e);
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-haspopup="menu"
      className={styles.trigger}
    >
      {children}
    </button>
  );
}
