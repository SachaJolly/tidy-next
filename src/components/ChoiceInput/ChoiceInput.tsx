'use client';

import React from 'react';

import styles from './ChoiceInput.module.scss';

type ChoiceInputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> & {
  type: 'checkbox' | 'radio';
  label: React.ReactNode;
  caption?: React.ReactNode;
};

export default function ChoiceInput({
  type,
  id,
  label,
  caption,
  className,
  disabled,
  ...props
}: ChoiceInputProps) {
  const classes = [styles.choice, className].filter(Boolean).join(' ');

  return (
    <label htmlFor={id} className={classes} aria-disabled={disabled ? 'true' : undefined}>
      <input
        id={id}
        type={type}
        className={styles.control}
        disabled={disabled}
        {...props}
      />
      <span className={styles.content}>
        <span className={styles.label}>{label}</span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </span>
    </label>
  );
}
