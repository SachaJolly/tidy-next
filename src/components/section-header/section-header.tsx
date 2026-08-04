import React from 'react';
import styles from './section-header.module.scss';
import Icon from '@/components/icon/icon';
import { getTranslations } from 'next-intl/server';

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default async function SectionHeader({ title, children }: SectionHeaderProps) {
  const common = await getTranslations('common');
  const t = await getTranslations('section-header');

  return (
    <div className={styles['header']}>
      <div className={styles['heading']}>
        <h2 className={styles['heading__title']}>{title}</h2>
        <a href="#" className={styles['heading__more']}>
          <span>{common('seeMore')}</span>
          <Icon name={'arrow_right'} size={16} />
        </a>
      </div>
      {children}
    </div>
  );
}
