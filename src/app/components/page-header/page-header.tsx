import React from "react";
import styles from "./page-header.module.scss";

interface PageHeaderProps {
  title: string;
  caption?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  caption,
  children,
}) => (
  <header className={styles["container"]}>
    <h1 className={styles["title"]}>{title}</h1>
    {caption && <p className={styles["caption"]}>{caption}</p>}
    {children}
  </header>
);

export default PageHeader;
