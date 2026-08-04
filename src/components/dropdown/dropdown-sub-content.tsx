'use client';

import React, { useContext, useState } from 'react';
import {
  DropdownSubContext,
  SubContentActiveContext,
  SearchContext,
  useDropdownContext,
} from './context';

export interface DropdownSubContentProps {
  children: React.ReactNode;
}

export function DropdownSubContent({ children }: DropdownSubContentProps) {
  const subCtx = useContext(DropdownSubContext);
  const { currentView } = useDropdownContext();
  const [query, setQuery] = useState('');

  if (!subCtx) throw new Error('<DropdownSubContent> must be inside <DropdownSub>');

  // Only render when this sub-menu IS the active view. Returning null also
  // unmounts the component, which resets the query state automatically —
  // so the search box starts fresh the next time the sub-menu opens.
  if (currentView !== subCtx.id) return null;

  return (
    // SubContentActiveContext signals to all descendants that they are inside
    // an active sub-menu and should render unconditionally (no root-view check).
    <SubContentActiveContext.Provider value={true}>
      {/* SearchContext is provided HERE so its scope is exactly one sub-menu. */}
      <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
    </SubContentActiveContext.Provider>
  );
}
