import React from 'react';

import styles from './Textarea.module.scss';

type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & {
  label?: string;
  id?: string;
};

const Textarea: React.FC<TextareaProps> = ({ label, id, className, autoFocus, ...props }) => {
  const classes = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={styles.textarea}
        autoFocus={autoFocus}
        data-autofocus={autoFocus ? 'true' : undefined}
        {...props}
      />
    </div>
  );
};

export default Textarea;
