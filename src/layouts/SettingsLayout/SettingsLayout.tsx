import React from 'react';
import { getTranslations } from 'next-intl/server';

import styles from './SettingsLayout.module.scss';
import SettingsSidebar from './SettingsSidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  const t = await getTranslations('settings');

  return (
    <main className={styles.container}>
      <section className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.description}>{t('description')}</p>
        </header>

        <div className={styles.body}>
          <SettingsSidebar />
          <section className={styles.main}>{children}</section>
        </div>
      </section>
    </main>
  );
}
