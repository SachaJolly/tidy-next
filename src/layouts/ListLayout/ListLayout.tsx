import React from 'react';
import styles from './ListLayout.module.scss';

interface ListLayoutProps {
  children: React.ReactNode;
}

export default function ListLayout({ children }: ListLayoutProps) {
  return (
    <div className={styles.container}>
      <section className={styles.content}>{children}</section>
    </div>
  );
}
