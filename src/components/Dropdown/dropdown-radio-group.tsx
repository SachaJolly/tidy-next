'use client';

import React, { useContext } from 'react';
import { SubContentActiveContext, RadioGroupContext, useDropdownContext } from './context';

export interface DropdownRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  label?: string;
  /**
   * When true, selecting a radio item closes the dropdown.
   * @default false — keeps the dropdown open so users can compare options.
   */
  closeOnSelect?: boolean;
}

export function DropdownRadioGroup({
  value,
  onValueChange,
  children,
  label,
  closeOnSelect = false,
}: DropdownRadioGroupProps) {
  const isInsideSubContent = useContext(SubContentActiveContext);
  const { currentView } = useDropdownContext();
  if (!isInsideSubContent && currentView !== 'root') return null;

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, closeOnSelect }}>
      <div role="radiogroup" aria-label={label}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
