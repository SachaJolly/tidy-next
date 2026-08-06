'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDropdownContext, useIsMobile } from './context';
import styles from './Dropdown.module.scss';
import Icon from '@/components/Icon/Icon';

export interface DropdownMenuProps {
  children: React.ReactNode;
  /** Horizontal alignment relative to the trigger. @default 'start' */
  align?: 'start' | 'end' | 'center';
  /**
   * Gap in pixels between the trigger edge and the panel.
   * Applies to both the "open below" and "flip above" positions.
   * @default 4
   */
  offset?: number;
  className?: string;
  /**
   * Renders the panel in-place (no portal, no fixed positioning).
   * Useful for Storybook stories or any context where the panel should
   * appear as a normal document element rather than a viewport overlay.
   */
  inline?: boolean;
  /** When true, the menu width follows the trigger width. */
  matchTriggerWidth?: boolean;
}

export function DropdownMenu({
  children,
  align = 'start',
  offset = 4,
  className,
  inline = false,
  matchTriggerWidth = false,
}: DropdownMenuProps) {
  const {
    open,
    close,
    triggerRef,
    currentView,
    subTitle,
    navigateBack,
    preventFocusOnOpen,
  } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [menuStyle, setContentStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const VIEWPORT_PADDING = 6;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const { width: menuWidth, height: ch } = menuRef.current.getBoundingClientRect();
    const cw = matchTriggerWidth ? triggerRect.width : menuWidth;
    let top = triggerRect.bottom + offset;
    let left = align === 'end' ? triggerRect.right - cw : triggerRect.left;
    if (top + ch > window.innerHeight - VIEWPORT_PADDING) {
      top = triggerRect.top - ch - offset;
    }
    if (left + cw > window.innerWidth - VIEWPORT_PADDING) {
      left = triggerRect.right - cw;
    }
    left = Math.max(VIEWPORT_PADDING, left);
    setContentStyle({
      position: 'fixed',
      top,
      left,
      width: matchTriggerWidth ? triggerRect.width : undefined,
      visibility: 'visible',
    });
  }, [align, offset, triggerRef, matchTriggerWidth]);

  useLayoutEffect(() => {
    if (inline || !open || isMobile) return;
    calculatePosition();

    if (preventFocusOnOpen) return;

    const rafId = requestAnimationFrame(() => {
      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]:not([disabled]), [role="radio"]:not([disabled])',
      );
      firstItem?.focus();
    });
    return () => cancelAnimationFrame(rafId);
  }, [inline, open, isMobile, calculatePosition, currentView, preventFocusOnOpen]);

  useEffect(() => {
    if (inline || !open || isMobile) return;
    const updatePosition = () => calculatePosition();
    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, { capture: true });
      window.removeEventListener('resize', updatePosition);
    };
  }, [inline, open, isMobile, calculatePosition]);

  // Add a ResizeObserver to recalculate position when the menu's height changes.
  // This is crucial for comboboxes where filtering items changes the height.
  useEffect(() => {
    if (inline || !open || isMobile || !menuRef.current) return;

    const observer = new ResizeObserver(() => {
      // We use requestAnimationFrame to avoid a "ResizeObserver loop limit exceeded"
      // error if the position calculation itself causes a resize.
      requestAnimationFrame(() => {
        calculatePosition();
      });
    });

    observer.observe(menuRef.current);

    return () => {
      observer.disconnect();
    };
  }, [inline, open, isMobile, calculatePosition]);

  useEffect(() => {
    if (inline || !open || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [inline, open, isMobile]);

  useEffect(() => {
    if (inline || !open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        (triggerRef.current as HTMLElement | null)?.focus();
      }
    };
    const handleClickOutside = (e: PointerEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [inline, open, close, triggerRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isArrow = e.key === 'ArrowDown' || e.key === 'ArrowUp';
    const isTab = e.key === 'Tab';
    if (!isArrow && !isTab) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled]), [role="radio"]:not([disabled])',
      ) ?? [],
    );
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (isTab) {
      e.preventDefault();
      const next = e.shiftKey
        ? (idx - 1 + items.length) % items.length
        : (idx + 1) % items.length;
      items[next]?.focus();
      return;
    }
    e.preventDefault();
    const next =
      e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  if (!open && !inline) return null;
  if (typeof document === 'undefined') return null;

  const isSubView = currentView !== 'root';
  const panel = (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      className={[styles.menu, isMobile && !inline && styles.drawer, className]
        .filter(Boolean)
        .join(' ')}
      style={
        inline ? { position: 'relative', visibility: 'visible' } : !isMobile ? menuStyle : undefined
      }
      onKeyDown={handleKeyDown}
    >
      {isSubView && (
        <div className={styles.subHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={navigateBack}
            aria-label="Go back to previous menu"
          >
            <Icon name="back" size={24} />
          </button>
          <span className={styles.subHeaderTitle}>{subTitle}</span>
        </div>
      )}
      {children}
    </div>
  );

  if (inline) return panel;
  const portalTarget =
    triggerRef.current?.closest('dialog') ?? document.getElementById('application-overlays');
  if (!portalTarget) return null;

  return createPortal(
    isMobile ? (
      <>
        <div className={styles.drawerOverlay} onClick={close} aria-hidden="true" />
        {panel}
      </>
    ) : (
      panel
    ),
    portalTarget,
  );
}
