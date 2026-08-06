import React from 'react';
import styles from './Card.module.scss';

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Structural wrapper that groups a single cohesive concern under a titled,
 * bordered card (e.g. a settings section, a dashboard panel).
 */
export default function Card({ title, description, children }: CardProps) {
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
