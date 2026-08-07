'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import Spinner from '@/components/Spinner/Spinner';
import styles from './Button.module.scss';
import { localizePath } from '@/lib/locale-path';

type BaseButtonProps = {
  icon?: IconName;
  hasDropdown?: boolean;
  label?: string; // `label` is now an optional prop for simple text
  children?: React.ReactNode; // `children` is also optional
  size?: 'default' | 'small';
  variant?: 'default' | 'interactive' | 'danger';
  tinted?: boolean;
  transparent?: boolean;
  loading?: boolean;
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
  loading = false,
  className,
  scroll,
  replace,
  ...props
}) => {
  const locale = useLocale();
  const isLoading = loading;
  const isDisabled = 'disabled' in props ? Boolean(props.disabled) : false;
  const isInert = isLoading || isDisabled;
  const classes = [
    styles.btn,
    size === 'small' && styles.small,
    styles[variant],
    tinted && styles.tinted,
    transparent && styles.transparent,
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine the content: prioritize `children`, fall back to `label`
  const content = children || label;

  const innerContent = (
    <>
      {isLoading && <Spinner hidden size={20} />}
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
      )}
      {content && <span className={styles.content}>{content}</span>}
      {hasDropdown && (
        <span className={styles.dropdown}>
          <Icon name="dropdown" size={20} />
        </span>
      )}
    </>
  );

  if ('href' in props && props.href) {
    const href = localizePath(props.href, locale);
    const linkProps = props as React.ComponentPropsWithoutRef<'a'>;
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isInert) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      linkProps.onClick?.(event);
    };

    return (
      <Link
        {...linkProps}
        className={classes}
        href={href}
        scroll={scroll}
        replace={replace}
        onClick={handleLinkClick}
        aria-busy={isLoading || undefined}
        aria-disabled={isInert || undefined}
        tabIndex={isInert ? -1 : linkProps.tabIndex}
      >
        {innerContent}
      </Link>
    );
  }

  const buttonProps = props as React.ComponentPropsWithoutRef<'button'>;

  return (
    <button
      {...buttonProps}
      className={classes}
      disabled={isInert || buttonProps.disabled}
      aria-busy={isLoading || undefined}
    >
      {innerContent}
    </button>
  );
};

export default Button;
