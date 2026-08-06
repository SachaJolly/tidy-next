import React from 'react';
import styles from './SettingsCard.module.scss';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Structural wrapper for a settings section.
 * Each card groups a single cohesive concern (e.g. Email, Username, Password).
 */
export default function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
