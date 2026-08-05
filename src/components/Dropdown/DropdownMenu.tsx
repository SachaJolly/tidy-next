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
}

export function DropdownMenu({
  children,
  align = 'start',
  offset = 4,
  className,
  inline = false,
}: DropdownMenuProps) {
  const { open, close, triggerRef, currentView, subTitle, navigateBack } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Start hidden so the element can be measured before the first browser paint.
  // calculatePosition reveals it after measuring — the whole sequence happens
  // in one layout pass so no flash is visible.
  const [menuStyle, setContentStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });

  // ─── Shared position calculator ───────────────────────────────────────────
  // Extracted as a stable useCallback so it can be called from both the
  // initial useLayoutEffect (synchronous, no-flash) and the scroll/resize
  // listeners (via requestAnimationFrame for performance).
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    // Minimum margin kept between the panel and the viewport edges.
    // Kept independent from `offset` so viewport clamping stays stable
    // regardless of what the consumer passes as trigger-gap.
    const VIEWPORT_PADDING = 6;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const { width: cw, height: ch } = menuRef.current.getBoundingClientRect();

    let top = triggerRect.bottom + offset;
    let left = align === 'end' ? triggerRect.right - cw : triggerRect.left;

    // Flip above the trigger when there is not enough room below the viewport fold.
    if (top + ch > window.innerHeight - VIEWPORT_PADDING) {
      top = triggerRect.top - ch - offset;
    }
    // Clamp to right viewport edge
    if (left + cw > window.innerWidth - VIEWPORT_PADDING) {
      left = triggerRect.right - cw;
    }
    // Clamp to left viewport edge
    left = Math.max(VIEWPORT_PADDING, left);

    setContentStyle({
      position: 'fixed',
      top,
      left,
      visibility: 'visible',
    });
  }, [align, offset, triggerRef]);
  // align and triggerRef are stable (prop string + ref object), so this callback
  // is effectively created once and never causes extra renders.

  // ─── Initial positioning (synchronous, before paint) ──────────────────────
  // useLayoutEffect fires synchronously after DOM mutations but before the
  // browser paints, so the panel goes from visibility:hidden → visible in one
  // frame — no layout shift or flash for the user.
  useLayoutEffect(() => {
    if (inline || !open || isMobile) return;
    calculatePosition();
  }, [inline, open, isMobile, calculatePosition, currentView]);
  // currentView dep: sub-menu views have different heights; re-measure when the
  // visible view changes to prevent misalignment after a drill-down.

  // ─── Desktop: continuous scroll / resize tracking ─────────────────────────
  // The panel is positioned with `fixed` relative to the viewport, but the
  // trigger moves as the page scrolls. Without tracking, the panel drifts away.
  // We listen in the CAPTURE phase so events from ANY scrollable ancestor are
  // caught, not just window-level scrolls.
  useEffect(() => {
    // Only activate on desktop — mobile uses the body scroll lock below.
    if (inline || !open || isMobile) return;

    let rafId = 0;

    // Wrap in requestAnimationFrame so that rapid scroll/resize events are
    // collapsed into at most one DOM measurement per animation frame (~16 ms),
    // preventing unnecessary layout thrashing.
    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculatePosition);
    };

    // capture: true ensures scroll events from nested scrollable elements
    // bubble up to window and trigger repositioning.
    window.addEventListener('scroll', scheduleUpdate, { capture: true, passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate, { capture: true });
      window.removeEventListener('resize', scheduleUpdate);
      // Cancel any pending frame so stale measurements don't apply after close.
      cancelAnimationFrame(rafId);
    };
  }, [inline, open, isMobile, calculatePosition]);

  // ─── Mobile: body scroll lock ──────────────────────────────────────────────
  // Prevent the background page from scrolling while the bottom drawer is open.
  useEffect(() => {
    // Only activate on mobile — desktop MUST stay scrollable.
    if (inline || !open || !isMobile) return;

    // Snapshot existing values so we can restore them exactly on cleanup,
    // even if the consumer had set their own overflow/touch-action styles.
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';

    // iOS Safari ignores overflow:hidden on <body> for momentum scrolling.
    // Setting touch-action:none on the body stops the default touch behavior
    // (panning/zooming) so the rubber-band scroll-through cannot happen.
    document.body.style.touchAction = 'none';

    return () => {
      // Restore originals — handles cases where the drawer closes, viewport
      // resizes from mobile to desktop, or the component unmounts.
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [inline, open, isMobile]);

  // Close on Escape — document-level so it fires regardless of where focus is
  useEffect(() => {
    if (inline || !open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      close();
      (triggerRef.current as HTMLElement | null)?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [inline, open, close, triggerRef]);

  // Close when a pointer-down lands outside both the panel and the trigger
  useEffect(() => {
    if (inline || !open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [inline, open, close, triggerRef]);

  // Arrow-key navigation between focusable menu items
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled]), [role="radio"]:not([disabled])',
      ) ?? [],
    );
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown' ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  if (!open && !inline) return null;
  if (typeof document === 'undefined') return null; // SSR guard

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
      {/* Back-navigation header — rendered automatically whenever a sub-menu is active.
          The title is supplied by DropdownMenuSubTrigger's `title` prop and stored
          in the view stack. No manual rendering required by the consumer. */}
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

  // In inline mode, render directly in the document flow (no portal, no overlay).
  if (inline) return panel;

  // Both desktop and mobile use createPortal to escape any overflow:hidden
  // ancestor — including a parent Modal dialog. The panel is appended to
  // document.body where z-index is resolved in the root stacking context.
  return createPortal(
    isMobile ? (
      <>
        {/* Dim overlay behind the drawer — sits just below the panel's z-index */}
        <div className={styles.drawerOverlay} onClick={close} aria-hidden="true" />
        {panel}
      </>
    ) : (
      panel
    ),
    document.body,
  );
}
