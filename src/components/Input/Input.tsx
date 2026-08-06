import React from 'react';

import styles from './Input.module.scss';

// We accept all standard input element props
type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  id?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({ id, prefix, suffix, className, autoFocus, ...props }) => {
  const classes = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {prefix || suffix ? (
        <div className={[styles.inputWrapper, prefix && styles.hasPrefix, suffix && styles.hasSuffix].filter(Boolean).join(' ')}>
          {prefix && <span className={styles.affix}>{prefix}</span>}
          <input
            id={id}
            className={styles.input}
            autoFocus={autoFocus}
            data-autofocus={autoFocus ? 'true' : undefined}
            {...props}
          />
          {suffix && <span className={styles.affix}>{suffix}</span>}
        </div>
      ) : (
        <input
          id={id}
          className={styles.input}
          autoFocus={autoFocus}
          data-autofocus={autoFocus ? 'true' : undefined}
          {...props}
        />
      )}
    </div>
  );
};

export default Input;
