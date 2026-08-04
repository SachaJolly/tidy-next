'use client';

import React, { useContext } from 'react';
import { SearchContext } from './context';
import styles from './dropdown.module.scss';
import Icon from '../icon/icon';

export interface DropdownSearchProps {
  placeholder?: string;
}

export function DropdownSearch({ placeholder = 'Search…' }: DropdownSearchProps) {
  const { setQuery } = useContext(SearchContext);

  return (
    <div className={styles.searchWrapper}>
      <span className={styles.searchIcon}>
        <Icon name="search" size={16} />
      </span>
      {/* autoFocus puts the cursor in the search box as soon as the
          sub-menu becomes visible, so the user can type immediately. */}
      <input
        type="search"
        autoFocus
        placeholder={placeholder}
        className={styles.searchInput}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
