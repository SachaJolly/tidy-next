import React from 'react';

import styles from './Input.module.scss';

// We accept all standard input element props
type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  label?: string;
  id?: string;
};

const Input: React.FC<InputProps> = ({ label, id, className, autoFocus, ...props }) => {
  const classes = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={styles.input}
        autoFocus={autoFocus}
        data-autofocus={autoFocus ? 'true' : undefined}
        {...props}
      />
    </div>
  );
};

export default Input;
