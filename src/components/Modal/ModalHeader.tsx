'use client';

import React from 'react';

import styles from './Modal.module.scss';
import { ModalContext } from './ModalContext';

export function ModalHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { titleId } = React.useContext(ModalContext);

  return (
    <div id={titleId} className={[styles.header, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
