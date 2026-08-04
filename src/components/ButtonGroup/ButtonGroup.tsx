import clsx from 'clsx';
import React from 'react';

import styles from './ButtonGroup.module.scss'; // Assuming you're using CSS Modules

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => (
  <div className={clsx(styles['btn-group'], className)}>{children}</div>
);

export default ButtonGroup;
