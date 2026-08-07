'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icons';
import styles from './NavLink.module.scss';

interface NavLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>,
  'href' | 'className' | 'prefix'
> {
  href?: string;
  label?: string;
  icon?: IconName;
  active?: boolean;
  className?: string | string[];
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const NavLink = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, NavLinkProps>(
  (
    { href, label, icon, active = false, className, children, prefix, suffix, ...rest },
    ref,
  ) => {
    const getModuleClasses = (classNames: string | string[] | undefined) => {
      if (!classNames) return [];
      const names = Array.isArray(classNames) ? classNames : [classNames];
      return names.map((name) => styles[name]).filter(Boolean);
    };

    const classes = [styles.link, active && styles.active, ...getModuleClasses(className)].filter(
      Boolean,
    );

    // Si pas de href, on se comporte comme un bouton stylisé
    if (!href) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes.join(' ')}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {prefix}
          {icon && <Icon name={icon} />}
          {label && <span>{label}</span>}
          {children}
          {suffix}
        </button>
      );
    }

    // Sinon, c'est un lien Next.js classique
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes.join(' ')}
        {...(rest as React.LinkHTMLAttributes<HTMLAnchorElement>)}
      >
        {prefix}
        {icon && <Icon name={icon} />}
        {label && <span>{label}</span>}
        {children}
        {suffix}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export default NavLink;
