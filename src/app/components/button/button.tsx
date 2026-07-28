import React from 'react';
import Link from 'next/link';
import Icon from '@/components/icon/icon';
import type { IconName } from '@/components/icon/icons';
import styles from './button.module.scss';

type BaseButtonProps = {
  icon?: IconName;
  label?: string; // `label` is now an optional prop for simple text
  children?: React.ReactNode; // `children` is also optional
  size?: 'default' | 'small';
  variant?: 'default' | 'interactive';
  tinted?: boolean;
  transparent?: boolean;
  className?: string;
  scroll?: boolean;
  replace?: boolean;
  /**
   * Controls route interception behaviour when `href` is set.
   * - `true`  → soft navigation via <Link>, triggers intercepting routes (modal).
   * - `false` → hard navigation via <a>, bypasses intercepting routes (full page).
   * Defaults to `true` to preserve existing soft-navigation behaviour.
   */
  modal?: boolean;
};

type ButtonProps = BaseButtonProps & (
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & { href?: never })
  | (Omit<React.ComponentPropsWithoutRef<'a'>, 'children' | 'href'> & { href: string })
);

const Button: React.FC<ButtonProps> = ({
  children,
  label,
  icon,
  size = 'default',
  variant = 'default',
  tinted,
  transparent,
  className,
  scroll,
  replace,
  modal = true,
  ...props
}) => {
  const classes = [
    styles.btn,
    size === 'small' && styles.small,
    styles[variant],
    tinted && styles.tinted,
    transparent && styles.transparent,
    className,
  ].filter(Boolean).join(' ');

  // Determine the content: prioritize `children`, fall back to `label`
  const content = children || label;

  const innerContent = (
    <>
      {icon && <Icon name={icon} size={20} />}
      {content && <span>{content}</span>}
    </>
  );

  if ('href' in props && props.href) {
    // Hard navigation (<a>) bypasses Next.js intercepting routes entirely,
    // loading the canonical full page instead of the modal overlay.
    if (!modal) {
      const { href, ...anchorProps } = props as { href: string } & React.ComponentPropsWithoutRef<'a'>;
      return (
        <a className={classes} href={href} {...anchorProps}>
          {innerContent}
        </a>
      );
    }

    // Soft navigation (<Link>) triggers intercepting routes, rendering the modal.
    return (
      <Link className={classes} scroll={scroll} replace={replace} {...(props as any)}>
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
