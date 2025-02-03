import React from "react";
import styles from "./page-header.module.scss";

interface PageHeaderProps {
  title: string;
  caption: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, caption }) => (
  <header className={styles["container"]}>
    <h1 className={styles["title"]}>{title}</h1>
    <p className={styles["caption"]}>{caption}</p>
  </header>
);

export default PageHeader;
