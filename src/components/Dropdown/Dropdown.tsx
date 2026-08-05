'use client';

import React, { useCallback, useRef, useState } from 'react';
import { DropdownContext } from './context';
import { DropdownTrigger } from './DropdownTrigger';

export interface DropdownProps {
  children?: React.ReactNode;
  /**
   * Optional trigger element rendered by the Dropdown itself.
   * This avoids wrapper-trigger hydration pitfalls (e.g. button-in-button).
   */
  trigger?: React.ReactNode;
}

/**
 * Dropdown component with built-in positioning, mobile drawer support, and
 * keyboard navigation. Uncontrolled by default — manages its own open state.
 *
 * - Desktop: Opens as a fixed-position dropdown next to the trigger
 * - Mobile: Opens as a full-height bottom drawer
 * - Keyboard: Escape to close, Arrow keys/Tab to navigate items
 * - Click outside to dismiss
 */
export function Dropdown({ children, trigger }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Stack-based navigation for nested submenus
  const [viewStack, setViewStack] = useState([{ id: 'root', title: '' }]);
  const currentView = viewStack[viewStack.length - 1].id;
  const subTitle = viewStack[viewStack.length - 1].title;

  const close = useCallback(() => {
    setOpen(false);
    // Reset view stack when closing so re-opening starts fresh
    setViewStack([{ id: 'root', title: '' }]);
  }, []);

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
      value={{ open, setOpen, close, triggerRef, currentView, navigateTo, navigateBack, subTitle }}
    >
      {triggerNode ? <DropdownTrigger asChild>{triggerNode}</DropdownTrigger> : null}
      {contentChildren}
    </DropdownContext.Provider>
  );
}
