"use client";

import React from "react";
import Icon from "@/app/components/icon/icon";
import styles from "./nav-link.module.scss";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'prefix'> {
  href?: string;
  label?: string;
  icon?: string;
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

  return (
    <a ref={ref} href={href} className={classes.join(" ")} {...rest}>
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
