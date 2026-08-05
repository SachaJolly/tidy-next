'use client';

import React from 'react';

import Icon from '@/components/Icon/Icon';

import styles from './Modal.module.scss';
import { ModalContext } from './ModalContext';

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
