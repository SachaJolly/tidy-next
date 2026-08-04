import React from 'react';
import '@/app/layout.module.scss';
import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className={styles.container}>
      <section className={styles['content']}>{children}</section>
    </main>
  );
}
