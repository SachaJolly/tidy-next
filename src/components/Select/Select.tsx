'use client';

import * as React from 'react';
import { Dropdown, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import Icon from '@/components/Icon/Icon';
import styles from './Select.module.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

type SelectOptionItem = SelectOption | SelectOptionGroup;

interface SelectOptionSection {
  label?: string;
  options: SelectOption[];
}

interface SelectProps {
  options: SelectOptionItem[];
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
  const suppressNextOpenRef = React.useRef(false);

  const isOptionGroup = React.useCallback((item: SelectOptionItem): item is SelectOptionGroup => {
    return 'options' in item;
  }, []);

  const sections = React.useMemo<SelectOptionSection[]>(
    () =>
      options.map((item) =>
        isOptionGroup(item)
          ? { label: item.label, options: item.options }
          : { options: [item] }
      ),
    [isOptionGroup, options]
  );

  const flatOptions = React.useMemo(
    () => sections.flatMap((section) => section.options),
    [sections]
  );

  const selectedOption = React.useMemo(
    () => flatOptions.find((option) => option.value === value),
    [flatOptions, value]
  );

  React.useEffect(() => {
    if (!isOpen) {
      setSearchValue(selectedOption ? selectedOption.label : '');
    }
  }, [isOpen, selectedOption]);

  const filteredSections = React.useMemo<SelectOptionSection[]>(() => {
    if (!searchValue || (selectedOption && searchValue === selectedOption.label)) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        options: section.options.filter((option) =>
          option.label.toLowerCase().includes(searchValue.toLowerCase())
        ),
      }))
      .filter((section) => section.options.length > 0);
  }, [searchValue, sections, selectedOption]);

  const indexedSections = React.useMemo(() => {
    let optionIndex = 0;
    return filteredSections.map((section) => ({
      label: section.label,
      options: section.options.map((option) => ({ ...option, optionIndex: optionIndex++ })),
    }));
  }, [filteredSections]);

  const filteredFlatOptions = React.useMemo(
    () => indexedSections.flatMap((section) => section.options),
    [indexedSections]
  );

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
    suppressNextOpenRef.current = true;
    onChange(selectedValue);
    setIsOpen(false);
    requestAnimationFrame(() => {
      suppressNextOpenRef.current = false;
    });
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
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredFlatOptions.length - 1));
        break;
      case 'ArrowUp':
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredFlatOptions[highlightedIndex]) {
          handleSelect(filteredFlatOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const dropdownIndicator = hideDropdownIcon ? undefined : (
    <span className={styles.dropdownIndicator} aria-hidden>
      <Icon name="dropdown" size={20} />
    </span>
  );

  return (
    <div className={[styles.select, className].filter(Boolean).join(' ')}>
      <Dropdown open={isOpen} onOpenChange={setIsOpen} preventFocusOnOpen={true}>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchValue(e.target.value);
          }}
          onClick={() => {
            requestAnimationFrame(() => {
              if (suppressNextOpenRef.current) {
                suppressNextOpenRef.current = false;
                return;
              }
              setIsOpen(true);
            });
          }}
          onFocus={(e) => {
            e.target.select();
            requestAnimationFrame(() => {
              if (suppressNextOpenRef.current) {
                suppressNextOpenRef.current = false;
                return;
              }
              setIsOpen(true);
            });
          }}
          onKeyDown={handleKeyDown}
          prefix={prefix}
          suffix={suffix}
          trailing={dropdownIndicator}
        />
        <DropdownMenu className="w-full">
          <div style={{ width: "100%" }}>
            {isOpen && filteredFlatOptions.length > 0 ? (
              indexedSections.map((section, sectionIndex) => (
                <React.Fragment key={section.label ?? `section-${sectionIndex}`}>
                  {section.label && <DropdownLabel>{section.label}</DropdownLabel>}
                  {section.options.map((option) => (
                    <DropdownItem
                      key={option.value}
                      ref={(el) => {
                        if (el) itemRefs.current[option.optionIndex] = el;
                      }}
                      isHighlighted={option.optionIndex === highlightedIndex}
                      onSelect={() => handleSelect(option.value)}
                      onMouseDown={() => {
                        suppressNextOpenRef.current = true;
                      }}
                    >
                      {option.label}
                    </DropdownItem>
                  ))}
                </React.Fragment>
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
