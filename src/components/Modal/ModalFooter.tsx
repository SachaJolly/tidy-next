import React from 'react';

import styles from './Modal.module.scss';

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={[styles.footer, className].filter(Boolean).join(' ')}>{children}</div>;
}
