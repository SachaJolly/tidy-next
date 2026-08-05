'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import styles from './Button.module.scss';
import { localizePath } from '@/lib/locale-path';

type BaseButtonProps = {
  icon?: IconName;
  hasDropdown?: boolean;
  label?: string; // `label` is now an optional prop for simple text
  children?: React.ReactNode; // `children` is also optional
  size?: 'default' | 'small';
  variant?: 'default' | 'interactive';
  tinted?: boolean;
  transparent?: boolean;
  className?: string;
  scroll?: boolean;
  replace?: boolean;
};

type ButtonProps = BaseButtonProps &
  (
    | (Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & { href?: never })
    | (Omit<React.ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & { href: string })
  );

const Button: React.FC<ButtonProps> = ({
  children,
  label,
  icon,
  hasDropdown = false,
  size = 'default',
  variant = 'default',
  tinted,
  transparent,
  className,
  scroll,
  replace,
  ...props
}) => {
  const locale = useLocale();
  const classes = [
    styles.btn,
    size === 'small' && styles.small,
    styles[variant],
    tinted && styles.tinted,
    transparent && styles.transparent,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine the content: prioritize `children`, fall back to `label`
  const content = children || label;

  const innerContent = (
    <>
      {icon && (
        <div className={styles.icon}>
          <Icon name={icon} size={20} />
        </div>
      )}
      {content && <span>{content}</span>}
      {hasDropdown && (
        <div className={styles.dropdown}>
          <Icon name="dropdown" size={20} />
        </div>
      )}
    </>
  );

  if ('href' in props && props.href) {
    const href = localizePath(props.href, locale);
    const linkProps = props as React.ComponentPropsWithoutRef<'a'>;
    return (
      <Link className={classes} href={href} scroll={scroll} replace={replace} {...linkProps}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ComponentPropsWithoutRef<'button'>)}>
      {innerContent}
    </button>
  );
};

export default Button;
