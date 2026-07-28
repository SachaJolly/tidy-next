import React from 'react';
import styles from './section-header.module.scss';
import Icon from '@/components/icon/icon';

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, children }) => (
  <div className={styles['header']}>
    <div className={styles['heading']}>
      <h2 className={styles['heading__title']}>{title}</h2>
      <a href="#" className={styles['heading__more']}>
        <span>See more</span>
        <Icon name={'arrow_right'} size={16} />
      </a>
    </div>
    {children}
  </div>
);

export default SectionHeader;
