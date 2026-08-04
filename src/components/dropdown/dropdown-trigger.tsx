'use client';

import React, { useCallback } from 'react';
import { useDropdownContext } from './context';
import styles from './dropdown.module.scss';

export interface DropdownTriggerProps {
  children: React.ReactNode;
  /**
   * When true, the trigger renders no DOM wrapper.
   * React.cloneElement injects onClick and ARIA attributes directly into
   * the single child element — ideal for custom-styled buttons or icon buttons.
   */
  asChild?: boolean;
}

type TriggerChildProps = React.HTMLAttributes<HTMLElement> & {
  onClick?: (e: React.MouseEvent) => void;
};

export function DropdownTrigger({
  children,
  asChild,
  ...rest
}: DropdownTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  const toggle = useCallback(() => setOpen(!open), [setOpen, open]);
  const restOnClick = rest.onClick as ((e: React.MouseEvent) => void) | undefined;
  const shouldRenderAsChild = asChild ?? React.isValidElement(children);

  if (shouldRenderAsChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<TriggerChildProps>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        triggerRef.current = e.currentTarget as HTMLElement;
        toggle();
        restOnClick?.(e);
        child.props.onClick?.(e);
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      ...rest,
    } as any);
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={(e) => {
        triggerRef.current = e.currentTarget;
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
