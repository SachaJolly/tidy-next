import React from "react";
import { icons, type IconName } from "./icons";
import styles from "./icon.module.scss";

interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "ref" | "color" | "size"> {
  /** Icon name from the registry */
  name: IconName;
  /** The size of the icon (12, 16, 20, 24) @default 24 */
  size?: 12 | 16 | 20 | 24;
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
}

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ name, size = 24, className, ...svgProps }, ref) => {
    const getModuleClasses = (classNames: string | string[] | undefined) => {
      if (!classNames) return [];
      const names = Array.isArray(classNames) ? classNames : [classNames];
      return names.map((name) => styles[name]).filter(Boolean);
    };

    const classes = [
      styles.icon,
      ...getModuleClasses(className),
    ].filter(Boolean);

    const icon = icons[name];

    return (
      <span 
        ref={ref}
        className={classes.join(" ")}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              size: String(size),
              width: size,
              height: size,
              ...svgProps,
            })
          : icon}
      </span>
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
