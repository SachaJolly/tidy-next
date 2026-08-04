'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.scss';
import Icon from '../Icon/Icon';

// ─── Focus trap ───────────────────────────────────────────────────────────────
// All element types that can receive keyboard focus. Used to cycle Tab/Shift+Tab
// within the dialog so focus never escapes into the inert background page.
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ─── Context ──────────────────────────────────────────────────────────────────
// Sharing dismiss() and titleId via context avoids passing props through every
// sub-component and keeps routing logic (router.back) in a single place.
// Any future slot (@lists, @items…) wrapping its page in <Modal> gets the same
// dismiss behaviour for free.
interface ModalContextValue {
  dismiss: () => void;
  titleId: string;
}
const ModalContext = React.createContext<ModalContextValue>({ dismiss: () => {}, titleId: '' });

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  children: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  // Called when the modal is dismissed (Esc, backdrop click, or ModalClose).
  // The consumer is responsible for any routing or state changes on close.
  // If omitted, the dialog simply closes with no side-effects.
  onClose?: () => void;
}

export function Modal({ children, size = 'default', onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  // Guard: prevents onClose from firing more than once when multiple close
  // paths trigger in the same tick (e.g. Esc fires both 'cancel' + 'close').
  const isDismissing = useRef(false);

  // Stable ID consumed by aria-labelledby on <dialog> and id on ModalHeader,
  // giving assistive technology a meaningful dialog label when a header is present.
  const titleId = useId();

  useEffect(() => {
    // The modal portal can only resolve once the browser has created the DOM.
    // We keep the first render null so SSR never touches `document`, which avoids
    // hydration mismatches and keeps the server/client trees identical.
    setMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    dialogRef.current?.close();
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal() promotes the element to the browser's top layer, which:
    //  • renders it above ALL page content regardless of z-index stacking
    //  • activates the native ::backdrop pseudo-element
    //  • enables built-in Esc handling (dispatches 'cancel' → 'close' events)
    // Guard against React StrictMode's double-invocation of effects, which
    // would call showModal() on an already-open dialog and throw InvalidStateError.
    if (!dialog.open) dialog.showModal();

    // ── Initial focus ──────────────────────────────────────────────────────
    // Deferred with setTimeout so any async content (forms, images) inside the
    // modal finishes rendering before we attempt to focus. rAF alone is not
    // reliable across all browsers when the modal contains lazy-loaded content.
    const focusTimer = setTimeout(() => {
      const target =
        dialog.querySelector<HTMLElement>('[data-autofocus="true"], [autofocus]') ??
        dialog.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([type="button"]), textarea',
        );
      // Fall back to the dialog itself so it is at least in the AT reading order.
      (target ?? dialog).focus();
    }, 10);

    // ── Focus trap ─────────────────────────────────────────────────────────
    // The HTML spec does not require browsers to trap focus inside <dialog>,
    // and behaviour is inconsistent. We enforce it manually so Tab/Shift+Tab
    // cycles only through focusable descendants of the dialog.
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
      if (!focusable.length) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab at the first element → wrap to the last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab at the last element → wrap to the first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    dialog.addEventListener('keydown', trapFocus);

    // ── Scroll lock ────────────────────────────────────────────────────────
    // Freeze the background page at its current offset. We restore all four
    // properties individually to avoid clobbering other code that may also
    // modify body styles (e.g. a nested modal or a cookie banner).
    const scrollY = window.scrollY;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    Object.assign(document.body.style, {
      overflow: 'hidden',
      position: 'fixed',
      top: `-${scrollY}px`,
      width: '100%',
    });

    return () => {
      clearTimeout(focusTimer);
      dialog.removeEventListener('keydown', trapFocus);
      Object.assign(document.body.style, prev);
      window.scrollTo(0, scrollY);
    };
  }, [mounted, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    // The native <dialog> fires click events on itself when the user clicks its
    // ::backdrop. We distinguish backdrop clicks from content clicks by checking
    // whether the pointer landed outside the dialog's bounding rectangle.
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isOutside =
      e.clientY < rect.top ||
      e.clientY > rect.bottom ||
      e.clientX < rect.left ||
      e.clientX > rect.right;
    if (isOutside) dismiss();
  };

  if (!mounted) {
    return null;
  }

  const portalTarget = document.getElementById('application-overlays');
  if (!portalTarget) {
    return null;
  }

  return ReactDOM.createPortal(
    // The overlay renders the scrim behind the dialog. The <dialog> is promoted
    // to the browser's top layer via showModal(), so it always appears above the
    // overlay visually regardless of DOM nesting or z-index.
    <div className={styles.overlay}>
      <ModalContext.Provider value={{ dismiss, titleId }}>
        <dialog
          ref={dialogRef}
          className={styles.modal}
          data-size={size}
          // aria-modal tells screen readers that content outside the dialog is
          // inert, matching the pointer/keyboard behaviour enforced above.
          aria-modal="true"
          // aria-labelledby links to the id set on ModalHeader's root element.
          // When no ModalHeader is rendered the attribute harmlessly references a
          // missing id; browsers and AT ignore dangling labelledby references.
          aria-labelledby={titleId}
          // onClose fires for both Esc and programmatic .close() calls.
          onClose={dismiss}
          onClick={handleBackdropClick}
        >
          {children}
        </dialog>
      </ModalContext.Provider>
    </div>,
    portalTarget,
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function ModalClose() {
  const { dismiss } = React.useContext(ModalContext);
  return (
    <button
      type="button"
      aria-label="Close dialog"
      onClick={dismiss}
      className={styles.closeButton}
    >
      <Icon name="close" size={24} />
    </button>
  );
}

export function ModalHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { titleId } = React.useContext(ModalContext);
  return (
    // id={titleId} is consumed by aria-labelledby on the parent <dialog>,
    // giving assistive technology a meaningful label for the dialog role.
    <div id={titleId} className={[styles.header, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function ModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={[styles.content, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={[styles.footer, className].filter(Boolean).join(' ')}>{children}</div>;
}
