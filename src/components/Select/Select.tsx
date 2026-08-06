'use client';

import * as React from 'react';
import { Dropdown, DropdownItem, DropdownMenu } from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import Icon from '@/components/Icon/Icon';
import styles from './Select.module.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** When true, the dropdown indicator arrow will be hidden. */
  hideDropdownIcon?: boolean;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  prefix,
  suffix,
  hideDropdownIcon,
}: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const itemRefs = React.useRef<(HTMLButtonElement | HTMLAnchorElement)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  React.useEffect(() => {
    if (!isOpen) {
      setSearchValue(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue || (selectedOption && searchValue === selectedOption.label)) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue, selectedOption]);

  React.useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
    }
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside the component
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dropdownIndicator = hideDropdownIcon ? undefined : (
    <span className={styles.dropdownIndicator} aria-hidden>
      <Icon name="dropdown" size={16} />
    </span>
  );

  return (
    <div ref={containerRef} className={`${styles.select} ${className ?? ''}`}>
      <Dropdown open={isOpen} onOpenChange={setIsOpen} preventFocusOnOpen={true}>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchValue(e.target.value);
          }}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onKeyDown={handleKeyDown}
          prefix={prefix}
          suffix={suffix}
          trailing={dropdownIndicator}
        />
        <DropdownMenu className="w-full">
          <div className="max-h-60 overflow-auto">
            {isOpen && filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <DropdownItem
                  key={option.value}
                  ref={(el) => {
                    if (el) itemRefs.current[index] = el;
                  }}
                  isHighlighted={index === highlightedIndex}
                  onSelect={() => handleSelect(option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {option.label}
                </DropdownItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                No results found.
              </div>
            )}
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
