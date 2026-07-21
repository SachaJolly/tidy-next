import React from "react";
import { icons, type IconName } from "./icons";
import styles from "./icon.module.scss";

interface IconProps {
  name: IconName;
  size?: "12px" | "16px" | "20px" | "24px";
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

  const icon = icons[name];

  return (
    <span className={classes.join(" ")}>
      {icon}
    </span>
  );
};

export default Icon;
