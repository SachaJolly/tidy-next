import React from "react";
import styles from "./section-header.module.scss";

interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, children }) => (
  <div className={styles["header"]}>
    <div className={styles["heading"]}>
      <h2 className={styles["heading__title"]}>{title}</h2>
      <a href="/alex/c" className={styles["heading__more"]}>
        See more
      </a>
    </div>
    {children}
  </div>
);

export default SectionHeader;
