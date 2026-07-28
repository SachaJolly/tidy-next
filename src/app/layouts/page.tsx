import styles from "./page.module.scss";
import React from "react";

interface PageProps {
  className?: string;
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children, className }) => {
  const getModuleClasses = (classNames: string | string[] | undefined) => {
    if (!classNames) return [];
    const names = Array.isArray(classNames) ? classNames : [classNames];
    return names.map((name) => styles[name]).filter(Boolean);
  };

  const classes = [styles.container, ...getModuleClasses(className)].filter(
    Boolean,
  );

  return (
    <main className={classes.join(" ")}>
      <section className={styles["content"]}>{children}</section>
    </main>
  );
};

export default Page;
