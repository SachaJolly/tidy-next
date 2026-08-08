import React from 'react';

import styles from './Input.module.scss';

// Omit the native HTML `prefix` attribute to avoid type conflict with our ReactNode prop.
type InputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'prefix'> & {
  id?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trailing?: React.ReactNode;
  /** The visual variant of the input, used for validation states. */
  variant?: 'success' | 'danger';
  /** A message displayed below the input, typically for validation feedback. */
  feedback?: string;
};

const Input: React.FC<InputProps> = ({
  id,
  prefix,
  suffix,
  trailing,
  className,
  autoFocus,
  variant,
  feedback,
  disabled,
  ...props
}) => {
  const containerClasses = [styles.container, className].filter(Boolean).join(' ');
  const inputWrapperClasses = [
    styles['input-wrapper'],
    prefix && styles.hasPrefix,
    suffix && styles.hasSuffix,
    trailing && styles.hasTrailing,
    variant && !disabled && styles[variant],
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  const feedbackClasses = [styles.feedback, variant && styles[`feedback-${variant}`]]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className={inputWrapperClasses}>
        {prefix && <span className={[styles.affix, styles['prefix-affix']].join(' ')}>{prefix}</span>}
        <input
          id={id}
          className={styles.input}
          disabled={disabled}
          autoFocus={autoFocus}
          data-autofocus={autoFocus ? 'true' : undefined}
          {...props}
        />
        {suffix && <span className={[styles.affix, styles['suffix-affix']].join(' ')}>{suffix}</span>}
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {feedback && <div className={feedbackClasses}>{feedback}</div>}
    </div>
  );
};

export default Input;
