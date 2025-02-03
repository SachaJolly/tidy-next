import React from "react";
import Icon from "../icon/icon";
import styles from "./button.module.scss";

interface ButtonProps {
  href?: string;
  label?: string;
  icon?: string;
  size?: "default" | "small";
  type?: "default" | "interactive";
  tinted?: boolean;
  transparent?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  href = "#",
  label,
  icon,
  size = "default",
  type = "default",
  tinted,
  transparent,
  className,
  onClick,
}) => {
  const classes = [
    styles.btn,
    size === "small" && styles.small,
    styles[type],
    tinted && styles.tinted,
    transparent && styles.transparent,
    className,
  ].filter(Boolean);

  return (
    <a href={href} className={classes.join(" ")} onClick={onClick}>
      {icon && <Icon name={icon} size="20px" />}
      {label && <span>{label}</span>}
    </a>
  );
};

export default Button;
