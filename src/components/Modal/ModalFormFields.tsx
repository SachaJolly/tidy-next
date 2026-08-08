import React from 'react';

import styles from './Modal.module.scss';

export function ModalFormFields({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[styles['form-fields'], className].filter(Boolean).join(' ')}
      style={{ flex: '1 1 auto', minHeight: 0 }}
    >
      {children}
    </div>
  );
}
