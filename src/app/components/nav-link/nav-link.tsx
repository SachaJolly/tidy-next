import React from "react";
import Icon from "../icon/icon";
import styles from "./nav-link.module.scss";

interface NavLinkProps {
  href?: string;
  label?: string;
  icon?: string;
  active?: boolean;
  className?: string | string[];
  children?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  href = "#",
  label,
  icon,
  active = false,
  className,
  children,
  prefix,
  suffix,
  onClick,
}) => {
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
    <a href={href} className={classes.join(" ")} onClick={onClick}>
      {prefix}
      {icon && <Icon name={icon} />}
      {label && <span>{label}</span>}
      {children}
      {suffix}
    </a>
  );
};

export default NavLink;
