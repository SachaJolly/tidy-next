import React from 'react';

import styles from './Modal.module.scss';

type ModalFooterJustify = 'start' | 'end' | 'space-between';

export function ModalFooter({
  children,
  className,
  justify = 'end',
}: {
  children: React.ReactNode;
  className?: string;
  justify?: ModalFooterJustify;
}) {
  return (
    <div
      className={[styles.footer, className].filter(Boolean).join(' ')}
      data-justify={justify}
    >
      {children}
    </div>
  );
}
