import React from 'react';

import styles from './Modal.module.scss';

export function ModalContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={[styles.content, className].filter(Boolean).join(' ')}>{children}</div>;
}
