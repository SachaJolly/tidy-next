import React from 'react';

import styles from './FormField.module.scss';

interface FormFieldProps {
  label: string;
  caption?: string;
  /** htmlFor wires the label to the inner input/textarea */
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout wrapper that stacks: label → caption → children (input or textarea).
 * Use this instead of the built-in `label` prop on Input/Textarea when you
 * need a descriptive caption beneath the label.
 */
export default function FormField({ label, caption, htmlFor, children, className }: FormFieldProps) {
  const classes = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {caption && <p className={styles.caption}>{caption}</p>}
      {children}
    </div>
  );
}
