import React from "react";
import styles from "./icon.module.scss";

interface IconProps {
  name: string;
  size?: "16px" | "20px" | "24px" | "32px" | "48px";
  className?: string | string[];
}

const Icon: React.FC<IconProps> = ({ name, size = "24px", className }) => {
  const getModuleClasses = (classNames: string | string[] | undefined) => {
    if (!classNames) return [];
    const names = Array.isArray(classNames) ? classNames : [classNames];
    return names.map((name) => styles[name]).filter(Boolean);
  };

  const classes = [
    styles.icon,
    styles[`is-${size}`],
    ...getModuleClasses(className),
  ].filter(Boolean);

  return <span className={classes.join(" ")}>{name}</span>;
};

export default Icon;
