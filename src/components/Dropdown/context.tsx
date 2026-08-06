'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ─── DropdownContext ───────────────────────────────────────────────────────

export interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  currentView: string;
  navigateTo: (id: string, title: string) => void;
  navigateBack: () => void;
  subTitle: string;
  /** When true, the dropdown will not automatically focus the first item on open. */
  preventFocusOnOpen?: boolean;
}

export const DropdownContext = createContext<DropdownContextValue | null>(null);

// ─── SubContentActiveContext ───────────────────────────────────────────────────
// When true, the consuming item/label/separator is inside an active sub-content
// and may render unconditionally (no currentView === 'root' guard needed).

export const SubContentActiveContext = createContext(false);

// ─── RadioGroupContext ─────────────────────────────────────────────────────────

export interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  closeOnSelect: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// ─── SearchContext ─────────────────────────────────────────────────────────────
// Scoped per DropdownMenuSubContent so each sub-menu has an independent query.

export interface SearchContextValue {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchContext = createContext<SearchContextValue>({
  query: '',
  setQuery: () => {},
});

// ─── DropdownSubContext ────────────────────────────────────────────────────
// Shared by DropdownMenuSubTrigger and DropdownMenuSubContent to identify which
// sub-menu they belong to without prop-drilling.

export interface DropdownSubContextValue {
  id: string;
}

export const DropdownSubContext = createContext<DropdownSubContextValue | null>(null);

// ─── useDropdownContext ────────────────────────────────────────────────────────

export function useDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown compound components must be inside <Dropdown>');
  return ctx;
}

// ─── useIsMobile ──────────────────────────────────────────────────────────────

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}
