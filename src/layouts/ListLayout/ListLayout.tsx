import React from 'react';
import styles from './ListLayout.module.scss';

interface ListLayoutProps {
  children: React.ReactNode;
  cover?: React.ReactNode;
}

export default function ListLayout({ children, cover }: ListLayoutProps) {
  return (
    <div className={styles.container}>
      {cover}
      <section className={styles.content}>{children}</section>
    </div>
  );
}
