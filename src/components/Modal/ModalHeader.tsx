'use client';

import React from 'react';

import styles from './Modal.module.scss';
import { ModalContext } from './ModalContext';

export function ModalHeader({
  title,
  children,
  className,
}: {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { titleId } = React.useContext(ModalContext);

  return (
    <div id={titleId} className={[styles.header, className].filter(Boolean).join(' ')}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
