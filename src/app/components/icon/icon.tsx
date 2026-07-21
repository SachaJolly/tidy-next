import React from "react";
import { icons, type IconName } from "./icons";
import styles from "./icon.module.scss";

interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "ref" | "color"> {
  /** Icon name from the registry */
  name: IconName;
  /** The size of the icon (12px, 16px, 20px, 24px) @default '24px' */
  size?: "12px" | "16px" | "20px" | "24px";
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = "24px", className, ...svgProps }, ref) => {
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
      <span 
        ref={ref}
        className={classes.join(" ")}
        {...(svgProps as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {icon}
      </span>
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
