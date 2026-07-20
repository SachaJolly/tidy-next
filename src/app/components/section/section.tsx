import React from "react";
import styles from "./section.module.scss";

interface SectionProps {
  className?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ className, children }) => {
  const getModuleClasses = (classNames: string | string[] | undefined) => {
    if (!classNames) return [];
    const names = Array.isArray(classNames) ? classNames : [classNames];
    return names.map((name) => styles[name]).filter(Boolean);
  };

  const classes = [styles.container, ...getModuleClasses(className)].filter(
    Boolean,
  );

  return <section className={classes.join(" ")}>{children}</section>;
};

export default Section;
