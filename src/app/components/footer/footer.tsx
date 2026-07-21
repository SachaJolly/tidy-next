import React from 'react';
import styles from './footer.module.scss';
import Icon from '../icon/icon';

interface FooterProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({}) => (
  <footer className={styles['container']}>
    <div className={styles['content']}>
      <div className={styles['copy']}>
        <span>© 2025</span>
        <span>TidyCards</span>
      </div>

      <nav className={styles['nav']}>
        <select className={`${styles['nav-select']} ${styles['dropdown-toggle']}`} name="language">
          <option value="en">English (US)</option>
          <option value="fr">Français (FR)</option>
        </select>
      </nav>
      <nav className={styles['nav']}>
        <a className={`${styles['nav-link']} ${styles['is-interactive']}`} href="#">
          <Icon name="subscription" size={16} />
          <span>Subscriptions</span>
        </a>
        <a className={styles['nav-link']} href="#">
          <span>About</span>
        </a>
        <a className={styles['nav-link']} href="#">
          <span>Terms</span>
        </a>
        <a className={styles['nav-link']} href="#">
          <span>Privacy</span>
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
