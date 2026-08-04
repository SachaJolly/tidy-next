import React from 'react';
import '@/app/layout.module.scss';
import styles from './auth.module.scss';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthLayoutProps) {
  return (
    <main className={styles.container}>
      <section className={styles['content']}>{children}</section>
    </main>
  );
}
