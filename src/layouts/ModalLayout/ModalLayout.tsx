import React from 'react';
import '@/app/layout.module.scss';
import styles from './ModalLayout.module.scss';

interface ModalLayoutProps {
  children: React.ReactNode;
}

export default function ModalLayout({ children }: ModalLayoutProps) {
  return (
    <main className={styles.container}>
      <section className={styles.content}>{children}</section>
    </main>
  );
}
