'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DropdownContext } from './context';
import { DropdownTrigger } from './DropdownTrigger';

export interface DropdownProps {
  children?: React.ReactNode;
  /**
   * Optional trigger element rendered by the Dropdown itself.
   * This avoids wrapper-trigger hydration pitfalls (e.g. button-in-button).
   */
  trigger?: React.ReactNode;
  /** The controlled open state of the dropdown. */
  open?: boolean;
  /** Event handler called when the open state of the dropdown changes. */
  onOpenChange?: (open: boolean) => void;
  /** When true, the dropdown will not automatically focus the first item on open. */
  preventFocusOnOpen?: boolean;
}

/**
 * Dropdown component with built-in positioning, mobile drawer support, and
 * keyboard navigation. Can be controlled or uncontrolled.
 */
export function Dropdown({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  preventFocusOnOpen = false,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Determine if the component is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

  // Stack-based navigation for nested submenus
  const [viewStack, setViewStack] = useState([{ id: 'root', title: '' }]);
  const currentView = viewStack[viewStack.length - 1].id;
  const subTitle = viewStack[viewStack.length - 1].title;

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  // When the dropdown is closed, always reset the view stack
  useEffect(() => {
    if (!open) {
      setViewStack([{ id: 'root', title: '' }]);
    }
  }, [open]);

  const navigateTo = useCallback((id: string, title: string) => {
    setViewStack((prev) => [...prev, { id, title }]);
  }, []);

  const navigateBack = useCallback(() => {
    setViewStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const childArray = React.Children.toArray(children);
  const hasExplicitTrigger = childArray.some(
    (child) => React.isValidElement(child) && child.type === DropdownTrigger,
  );

  const shouldAutoDetectTrigger = !trigger && !hasExplicitTrigger && childArray.length >= 2;
  const autoDetectedTrigger = shouldAutoDetectTrigger ? childArray[0] : null;
  const contentChildren = shouldAutoDetectTrigger ? childArray.slice(1) : childArray;
  const triggerNode = trigger ?? autoDetectedTrigger;

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        close,
        triggerRef,
        currentView,
        navigateTo,
        navigateBack,
        subTitle,
        preventFocusOnOpen,
      }}
    >
      {triggerNode ? <DropdownTrigger asChild>{triggerNode}</DropdownTrigger> : null}
      {contentChildren}
    </DropdownContext.Provider>
  );
}
