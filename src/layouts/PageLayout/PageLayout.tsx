import React from 'react';
import styles from './PageLayout.module.scss';

interface PageLayoutProps {
  className?: string;
  children: React.ReactNode;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  const getModuleClasses = (classNames: string | string[] | undefined) => {
    if (!classNames) return [];
    const names = Array.isArray(classNames) ? classNames : [classNames];
    return names.map((name) => styles[name]).filter(Boolean);
  };

  const classes = [styles.container, ...getModuleClasses(className)].filter(Boolean);

  return (
    <main className={classes.join(' ')}>
      <section className={styles.content}>{children}</section>
    </main>
  );
}
