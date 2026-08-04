'use client';

import React from 'react';
import { DropdownSubContext } from './context';

export interface DropdownSubProps {
  /** Unique id for this sub-menu — used to identify the active drill-down view. */
  id: string;
  children: React.ReactNode;
}

export function DropdownSub({ id, children }: DropdownSubProps) {
  return <DropdownSubContext.Provider value={{ id }}>{children}</DropdownSubContext.Provider>;
}
