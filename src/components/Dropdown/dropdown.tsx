'use client';

import React, { useCallback, useRef, useState } from 'react';
import { DropdownContext } from './context';
import { DropdownTrigger } from './dropdown-trigger';

export interface DropdownProps {
  children?: React.ReactNode;
  /**
   * Optional trigger element rendered by the Dropdown itself.
   * This avoids wrapper-trigger hydration pitfalls (e.g. button-in-button).
   */
  trigger?: React.ReactNode;
  /** Controlled open state — leave unset for uncontrolled behaviour. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({ children, trigger, open: controlledOpen, onOpenChange }: DropdownProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen! : internalOpen;

  const triggerRef = useRef<HTMLElement | null>(null);

  // Stack-based drill-down navigation: each entry is { id, title }.
  // 'root' is always the first frame; pushing adds a sub-menu frame.
  const [viewStack, setViewStack] = useState([{ id: 'root', title: '' }]);
  const currentView = viewStack[viewStack.length - 1].id;
  const subTitle = viewStack[viewStack.length - 1].title;

  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    // Always reset the view stack when closing so re-opening starts at root.
    setViewStack([{ id: 'root', title: '' }]);
  }, [setOpen]);

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
