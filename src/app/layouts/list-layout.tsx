import React from 'react';
import styles from './list-layout.module.scss';

interface ListLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ListLayout({ children, className }: ListLayoutProps) {
  return (
    <div className={styles['container']}>
      <section className={styles['content']}>{children}</section>
    </div>
  );
}
