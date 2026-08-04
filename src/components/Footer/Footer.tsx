'use client';

import React from 'react';
import styles from './Footer.module.scss';
import Icon from '@/components/Icon/Icon';
import { useTranslations } from 'next-intl';

interface FooterProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Footer({}: FooterProps) {
  const t = useTranslations('footer');
  const common = useTranslations('common');

  return (
    <footer className={styles['container']}>
      <div className={styles['content']}>
        <div className={styles['copy']}>
          <span>© {new Date().getFullYear()}</span>
          <span>{t('brand')}</span>
        </div>

        <nav className={`${styles['nav']}`}>
          <select
            className={`${styles['nav-select']} ${styles['dropdown-toggle']}`}
            name="language"
          >
            <option value="en">{common('language.english')}</option>
            <option value="fr">{common('language.french')}</option>
          </select>
        </nav>
        <nav className={styles['nav']}>
          <a className={`${styles['nav-link']} ${styles['is-interactive']}`} href="#">
            <Icon name="subscription" size={16} />
            <span>{t('subscriptions')}</span>
          </a>
          <a className={styles['nav-link']} href="#">
            <span>{t('about')}</span>
          </a>
          <a className={styles['nav-link']} href="#">
            <span>{t('terms')}</span>
          </a>
          <a className={styles['nav-link']} href="#">
            <span>{t('privacy')}</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
