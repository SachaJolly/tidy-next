"use client";

import React from "react";
import { useLocale } from "next-intl";
import Icon from "@/components/icon/icon";
import type { IconName } from "@/components/icon/icons";
import styles from "./nav-link.module.scss";
import { localizePath } from "@/lib/locale-path";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'prefix'> {
  href?: string;
  label?: string;
  icon?: IconName;
  active?: boolean;
  className?: string | string[];
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(({
  href = "#",
  label,
  icon,
  active = false,
  className,
  children,
  prefix,
  suffix,
  ...rest
}, ref) => {
  const locale = useLocale();

  const getModuleClasses = (classNames: string | string[] | undefined) => {
    if (!classNames) return [];
    const names = Array.isArray(classNames) ? classNames : [classNames];
    return names.map((name) => styles[name]).filter(Boolean);
  };

  const classes = [
    styles.link,
    active && styles.active,
    ...getModuleClasses(className),
  ].filter(Boolean);
  const resolvedHref = localizePath(href, locale);

  return (
    <a ref={ref} href={resolvedHref} className={classes.join(" ")} {...rest}>
      {prefix}
      {icon && <Icon name={icon} />}
      {label && <span>{label}</span>}
      {children}
      {suffix}
    </a>
  );
});

NavLink.displayName = "NavLink";

export default NavLink;
