import React from 'react';

import styles from './Spinner.module.scss';

type SpinnerProps = Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> & {
  size?: 12 | 16 | 20 | 24;
  label?: string;
  hidden?: boolean;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 16,
  label = 'Loading',
  hidden = false,
  className,
  ...props
}) => {
  const sizeClass = styles[`size${size}`];
  const containerClasses = [styles['spinner-container'], sizeClass].filter(Boolean).join(' ');
  const classes = [styles.spinner, sizeClass, className].filter(Boolean).join(' ');

  return (
    <span className={containerClasses}>
      <span
        {...props}
        className={classes}
        role={hidden ? undefined : 'status'}
        aria-live={hidden ? undefined : 'polite'}
        aria-label={hidden ? undefined : label}
        aria-hidden={hidden || undefined}
      />
    </span>
  );
};

export default Spinner;
